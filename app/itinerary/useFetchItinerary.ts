import {
	computeMotisTrip,
	isNotTransitItinerary,
} from '@/app/itinerary/transit/motisRequest'
import distance from '@turf/distance'
import { useCallback, useEffect, useState } from 'react'
import { useMemoPointsFromState } from './useDrawItinerary'
import { modeKeyFromQuery } from './Itinerary'
import useSetSearchParams from '@/components/useSetSearchParams'
import fetchValhalla from './fetchValhalla'
import computeSafeRatio from '@/components/cycling/computeSafeRatio'
import brouterResultToSegments from '@/components/cycling/brouterResultToSegments'
import useSetItineraryModeFromUrl from './useSetItineraryModeFromUrl'
import { decodeDate, initialDate } from './transit/utils'

export default function useFetchItinerary(searchParams, state, allez) {
	const setSearchParams = useSetSearchParams()
	const [routes, setRoutes] = useState(null)
	const date = decodeDate(searchParams.date) || initialDate()
	const bikeRouteProfile = searchParams['profil-velo'] || 'safety'
	const setBikeRouteProfile = useCallback(
		(profile) => setSearchParams({ 'profil-velo': profile }),
		[setSearchParams]
	)
	const mode = modeKeyFromQuery(searchParams.mode)
	// TODO This could be a simple derived variable but we seem to be using it in a
	// button down below, not sure if it's relevant, why not wait for the url to
	// change ?
	const [isItineraryMode, setIsItineraryMode] = useState(false)

	useSetItineraryModeFromUrl(allez, setIsItineraryMode)

	const updateRoute = useCallback(
		(key, value) =>
			setRoutes((routes) => ({ ...(routes || {}), [key]: value })),
		[routes, setRoutes]
	)

	const [serializedPoints, points] = useMemoPointsFromState(state)

	/* Routing requests are made here */
	useEffect(() => {
		console.log('lightgreen useeffect', serializedPoints, points)
		if (points.length < 2) {
			setRoutes(null)
			return
		}
		async function fetchBrouterRoute(
			points,
			itineraryDistance,
			profile,
			maxDistance
		) {
			if (itineraryDistance > maxDistance) return null

			const lonLats = points
				.map(
					({
						geometry: {
							coordinates: [lon, lat],
						},
					}) => `${lon},${lat}`
				)
				.join('|')
			const url = `https://brouter.osc-fr1.scalingo.io/brouter?lonlats=${lonLats}&profile=${profile}&alternativeidx=0&format=geojson`
			const res = await fetch(url)
			const clone = res.clone()
			try {
				const json = await res.json()
				if (!json.features) return
				if (mode === 'cycling') {
					const cyclingSegmentsGeojson = brouterResultToSegments(json)

					const safeRatio = computeSafeRatio(cyclingSegmentsGeojson)
					console.log('lightgreen safe', cyclingSegmentsGeojson, safeRatio)
					return { ...json, safe: { cyclingSegmentsGeojson, safeRatio } }
				}

				return json
			} catch (e) {
				const text = await clone.text()

				return { state: 'error', reason: text }
			}
		}

		//TODO fails is 3rd point is closer to 1st than 2nd, use reduce that sums
		const itineraryDistance = distance(points[0], points.slice(-1)[0])

		const fetchRoutes = async () => {
			updateRoute('cycling', 'loading')
			const cycling = await fetchBrouterRoute(
				points,
				itineraryDistance,
				bikeRouteProfile,
				mode === 'cycling' ? Infinity : 35 // ~ 25 km/h (ebike) x 1:30 hours
			)
			updateRoute('cycling', cycling)

			if (mode === 'car') {
				updateRoute('car', 'loading')
				const car = await fetchValhalla(
					points,
					itineraryDistance,
					null,

					1 //to be tweaked. We don't want to recommand this heavily polluting means of transport on the default itinerary result
				)
				updateRoute('car', car)
				console.log('purple car', car)
			} else {
				updateRoute('car', null)
			}

			updateRoute('walking', 'loading')
			const walking = await fetchBrouterRoute(
				points,
				itineraryDistance,
				'hiking-mountain',
				mode === 'walking' ? Infinity : 4 // ~ 3 km/h donc 4 km = 1h20 minutes, au-dessus ça me semble peu pertinent de proposer la marche par défaut
			)
			updateRoute('walking', walking)
		}
		fetchRoutes()
	}, [points, setRoutes, bikeRouteProfile, mode])

	useEffect(() => {
		if (points.length < 2) {
			setRoutes(null)
			return
		}

		async function fetchTransitRoute(multiplePoints, itineraryDistance, date) {
			const minTransitDistance = 0.5 // please walk or bike
			if (itineraryDistance < minTransitDistance)
				return {
					state: 'error',
					reason: `Le mode transport en commun est désactivé quand la distance à vol d'oiseau du trajet est inférieure à ${
						minTransitDistance * 1000
					} m.`,
					solution: `Votre trajet actuel fait ${Math.round(
						itineraryDistance * 1000
					)} m.`,
				}
			const points =
				multiplePoints.length > 2
					? [multiplePoints[0], multiplePoints.slice(-1)[0]]
					: multiplePoints
			const lonLats = points.map(
				({
					geometry: {
						coordinates: [lng, lat],
					},
				}) => ({ lat, lng })
			)

			console.log(
				'Will request motis intermodal',
				lonLats,
				date,
				multiplePoints
			)

			const json = await computeMotisTrip(
				lonLats[0],
				lonLats[1],
				date,
				searchParams
			)

			if (json.state === 'error') return json

			const { itineraries } = json

			const transitItineraries = itineraries.filter(
				(itinerary) => !isNotTransitItinerary(itinerary)
			)

			const modeVerbs = {
				CAR: 'conduirez',
				WALK: 'marcherez',
				BIKE: 'roulerez',
			}
			if (itineraries.length === 1 && isNotTransitItinerary(itineraries[0])) {
				const word = modeVerbs[itineraries[0].legs[0].mode]

				return {
					state: 'error',
					reason: `Vous ${word} davantage pour aller prendre le bus que d'y aller directement 😅`,
					solution: `Changez les options d'approche et d'arrivée`,
				}
			}

			if (transitItineraries.length === 0) {
				if (searchParams.planification !== 'oui') {
					return setSearchParams({ planification: 'oui' })
				}

				return {
					state: 'error',
					reason: 'Pas de transport en commun trouvé :/',
				}
			}
			console.log('indigo motis filtered', transitItineraries)
			return { ...json, itineraries: transitItineraries }
		}
		//TODO fails is 3rd point is closer to 1st than 2nd, use reduce that sums
		const itineraryDistance = distance(points[0], points.slice(-1)[0])

		updateRoute('transit', { state: 'loading' })
		fetchTransitRoute(points, itineraryDistance, date).then((transit) =>
			setRoutes((routes) => ({ ...routes, transit }))
		)
	}, [
		points,
		setRoutes,
		date,
		searchParams.correspondances,
		searchParams.debut,
		searchParams.fin,
		searchParams.tortue,
		searchParams.planification,
	])

	const resetItinerary = useCallback(
		() =>
			setSearchParams({
				allez: undefined,
				mode: undefined,
				choix: undefined,
				debut: undefined,
				fin: undefined,
				planification: undefined,
				'profil-velo': undefined,
				itiPosition: undefined,
			}),
		[setSearchParams]
	)

	const itinerary = {
		bikeRouteProfile,
		setBikeRouteProfile,
		isItineraryMode,
		setIsItineraryMode,
		reset: resetItinerary,
		routes,
		date,
	}
	return itinerary
}
