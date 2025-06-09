import brouterResultToSegments from '@/components/cycling/brouterResultToSegments'
import computeSafeRatio from '@/components/cycling/computeSafeRatio'
import {
	hasSatisfyingTransitItinerary,
	smartMotisRequest,
} from '@/components/transit/smartItinerary'
import useSetSearchParams from '@/components/useSetSearchParams'
import distance from '@turf/distance'
import { useCallback, useEffect, useState } from 'react'
import { modeKeyFromQuery } from './Itinerary'
import fetchValhalla from './fetchValhalla'
import { decodeDate, initialDate } from './transit/utils'
import { useMemoPointsFromState } from './useDrawItinerary'
import useSetItineraryModeFromUrl from './useSetItineraryModeFromUrl'
import useEffectDebugger from '@/components/useEffectDebugger'

export default function useFetchItinerary(searchParams, state, allez) {
	const setSearchParams = useSetSearchParams()
	const [routes, setRoutes] = useState({})
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
		(key, value) => setRoutes((routes) => ({ ...routes, [key]: value })),
		[routes, setRoutes]
	)

	const [serializedPoints, points] = useMemoPointsFromState(state)

	const itineraryDistance = points.reduce((memo, next, i) => {
		if (i === points.length - 1) return memo
		const segment = distance(next, points[i + 1])
		return memo + segment
	}, 0)

	useEffect(() => {
		if (points.length < 2) {
			setRoutes(null)
		}
	}, [setRoutes, points])

	/* Routing requests are made here */
	useEffect(() => {
		if (points.length < 2) return

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

		const fetchNonTransitRoutes = async () => {
			if (!mode || mode === 'cycling') {
				updateRoute('cycling', 'loading')
				const cycling = await fetchBrouterRoute(
					points,
					itineraryDistance,
					bikeRouteProfile,
					mode === 'cycling' ? Infinity : 35 // ~ 25 km/h (ebike) x 1:30 hours
				)
				updateRoute('cycling', cycling)
			}
			if (!mode || mode === 'walking') {
				updateRoute('walking', 'loading')
				const walking = await fetchBrouterRoute(
					points,
					itineraryDistance,
					'hiking-mountain',
					mode === 'walking' ? Infinity : 4 // ~ 3 km/h donc 4 km = 1h20 minutes, au-dessus ça me semble peu pertinent de proposer la marche par défaut
				)
				updateRoute('walking', walking)
			}

			if (mode === 'car') {
				//no car in the transit summary. Avoid cars.
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
		}
		fetchNonTransitRoutes()
	}, [points, bikeRouteProfile, mode])

	const hasSatisfying =
		routes?.transit &&
		hasSatisfyingTransitItinerary(routes.transit, date, itineraryDistance)

	useEffectDebugger(() => {
		if (points.length < 2) return

		const computeTransit = mode == null || mode === 'transit'
		if (!computeTransit) return

		const hasSatisfying =
			routes.transit &&
			hasSatisfyingTransitItinerary(routes.transit, date, itineraryDistance)

		console.log('indigo yoyo', computeTransit, hasSatisfying)
		if (hasSatisfying) return

		async function fetchTransitRoute(multiplePoints, itineraryDistance, date) {
			const minTransitDistance = 0.5 // please walk or bike
			if (itineraryDistance < minTransitDistance)
				return {
					state: 'error',
					reason: `Nous ne calculons pas les transports en commun quand la distance à vol d'oiseau du trajet est inférieure à ${
						minTransitDistance * 1000
					} m.`,
					solution: `Votre trajet actuel fait ${Math.round(
						itineraryDistance * 1000
					)} m.`,
				}
			// Motis v2 does not handle multiple points
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

			const start = lonLats[0],
				destination = lonLats[1]

			const result = await smartMotisRequest(
				searchParams,
				itineraryDistance,
				start,
				destination,
				date,
				setSearchParams
			)
			return result
		}

		if (routes.transit?.state !== 'loading') {
			updateRoute('transit', { state: 'loading' })
		}

		// could be inefficient or insecure to give setRoutes to this function.
		// Rather give "setRoute(key)", like updateRoute above
		fetchTransitRoute(points, itineraryDistance, date).then(
			(transit) => transit && updateRoute('transit', transit)
		)
	}, [
		mode,
		points,
		updateRoute,
		date,
		searchParams.correspondances,
		searchParams.debut,
		searchParams.fin,
		searchParams.tortue,
		searchParams.planification,
		searchParams.auto,
	])

	const resetItinerary = useCallback(
		() =>
			setSearchParams({
				auto: undefined,
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
		distance: itineraryDistance,
	}
	return itinerary
}
