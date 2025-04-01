import useSetSearchParams from '@/components/useSetSearchParams'
import { useEffect, useMemo } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { buildAllezPart, removeStatePart } from '../SetDestination'
import useDrawTransit from '../effects/useDrawTransit'
import { modeKeyFromQuery } from './Itinerary'
import { letterFromIndex } from './Steps'
import { geoSerializeSteps } from './areStepsEqual'
import useDrawRoute from './useDrawRoute'
import useFetchDrawBikeParkings from './useFetchDrawBikeParkings'
import brouterResultToSegments from '@/components/cycling/brouterResultToSegments'
import useDrawCyclingSegments from '../effects/useDrawCyclingSegments'
import valhallaGeojson from './valhallaGeojson'

const joinFeatureCollections = (elements) => ({
	type: 'FeatureCollection',
	features: elements.map((element) => element.features).flat(),
})
export default function useDrawItinerary(
	map,
	isItineraryMode,
	searchParams,
	state,
	zoom,
	routes,
	date
) {
	const mode = modeKeyFromQuery(searchParams.mode)
	const desktop = useMediaQuery('(min-width: 800px)')

	//TODO check if this fails with the new step.stepBeingSearched
	useEffect(() => {
		if (!map) return
		if (state.length === 2 && state[0] == null && state[1] !== null) {
			map.flyTo({ zoom: zoom - 2, padding: { bottom: desktop ? 0 : 400 } })
		}
	}, [searchParams.allez, map, desktop])

	const selectedConnection = searchParams.choix

	//const [motisTrips, setMotisTrips] = useState(null)
	//useMotisTrips(routes?.transit, selectedConnection, setMotisTrips)
	// not sure this is useful. On the routes I've tried, there is no precise
	// geojson shape for trains, buses (appart from straight lines from stop to
	// stop) nor walk

	useFetchDrawBikeParkings(map, mode === 'cycling' && routes?.cycling)

	const setSearchParams = useSetSearchParams()

	const [serializedPoints, points] = useMemoPointsFromState(state)

	const linestrings = useMemo(
		() =>
			points.length < 1
				? []
				: [
						{
							type: 'Feature',
							properties: {},

							geometry: {
								type: 'LineString',
								coordinates: points.map((point) => {
									return point.geometry.coordinates
								}),
							},
						},
				  ],
		[points]
	)

	const rawDistance = linestrings
		.map((el) => el.properties['track-length'] / 1000)
		.reduce((memo, next) => memo + next, 0)

	const distanceGeojson = useMemo(
		() => ({
			type: 'FeatureCollection',
			features: [...points, ...linestrings],
		}),
		[points, linestrings]
	)

	useDrawRoute(isItineraryMode, map, distanceGeojson, 'distance')

	const cyclingReady =
		(!mode || mode === 'cycling') &&
		routes &&
		routes.cycling &&
		routes.cycling !== 'loading'

	useDrawCyclingSegments(
		isItineraryMode,
		map,
		cyclingReady && routes.cycling.safe?.cyclingSegmentsGeojson
	)

	useDrawRoute(isItineraryMode, map, cyclingReady && routes.cycling, 'cycling')

	useDrawRoute(
		isItineraryMode,
		map,
		(!mode || mode === 'walking') &&
			routes &&
			routes.walking !== 'loading' &&
			routes.walking,
		'walking'
	)
	const carReady = mode === 'car' && routes && routes.car !== 'loading' // If no mode, summary mode, we don't show this heavily polluting mode, the user has to force it

	const carGeojson = useMemo(() => {
		if (!carReady || !routes.car) return

		return valhallaGeojson(routes.car)
	}, [carReady, routes?.car])

	useDrawRoute(isItineraryMode, map, carReady && carGeojson, 'car')

	useDrawTransit(
		map,
		(!mode || mode === 'transit') && routes?.transit,
		selectedConnection,
		date
	)

	const oldAllez = searchParams.allez
	useEffect(() => {
		if (!map || !isItineraryMode) return

		const beingSearchedIndex = state.findIndex(
			(step) => step?.stepBeingSearched
		)
		const stepIndexToEdit =
				beingSearchedIndex > -1
					? beingSearchedIndex
					: state.length === 0
					? 0
					: state.findIndex((step) => step == null || !step.allezValue),
			awaitingNewStep = stepIndexToEdit != null
		const onClick = (e) => {
			const distancePointsLayer = map.getLayer('distancePoints')
			const features =
				distancePointsLayer &&
				points &&
				map.queryRenderedFeatures(e.point, {
					layers: ['distancePoints'],
				})

			// If a feature was clicked, remove it from the map
			if (features?.length) {
				const allezValue = features[0].properties.allezValue
				setSearchParams({ allez: removeStatePart(allezValue, state) })
			} else {
				if (!awaitingNewStep) return
				const allezPart = buildAllezPart(
					'Point sur la carte',
					null,
					e.lngLat.lng,
					e.lngLat.lat
				)

				if (!state || state.length === 1) {
					const allez = allezPart + '->'
					return setSearchParams({
						allez,
					})
				}
				const allez = state
					.map((step, index) =>
						index === stepIndexToEdit ? allezPart : step.allezValue
					)
					.join('->')

				return setSearchParams({
					allez,
				})
			}
		}

		const onMouseMove = (e) => {
			const features =
				points?.length &&
				map.queryRenderedFeatures(e.point, {
					layers: ['distance' + 'Points'], // the points are handled by the distance mode
				})
			// UI indicator for clicking/hovering a point on the map
			map.getCanvas().style.cursor = features.length
				? 'pointer'
				: awaitingNewStep
				? 'crosshair'
				: ''
		}

		map.on('click', onClick)
		map.on('mousemove', onMouseMove)
		return () => {
			if (!map || !isItineraryMode) return
			map.off('click', onClick)
			map.off('mousemove', onMouseMove)
			map.getCanvas().style.cursor = ''
		}
	}, [
		map,
		serializedPoints,
		setSearchParams,
		isItineraryMode,
		oldAllez,
		mode,
		state,
	])

	// GeoJSON object to hold our measurement features

	useEffect(() => {
		if (!map || isItineraryMode || map.getSource) return
		const source = map.getSource('measure-points')
		if (!source) return

		map.removeLayer('measure-lines')
		map.removeLayer('measure-points')
		map.removeSource('measure-points')
	}, [isItineraryMode, map, serializedPoints])

	/* Not sure it's useful to display the distance in this multimodal new mode
	const computedDistance = isNaN(rawDistance)
		? '...'
		: rawDistance < 1
		? Math.round(rawDistance * 1000) + ' m'
		: rawDistance < 10
		? Math.round(rawDistance * 10) / 10 + ' km'
		: Math.round(rawDistance) + ' km'

*/
}

export const useMemoPointsFromState = (state) => {
	/*
	 * {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [
      -1.6369411434976087,
      48.17932437715612
    ]
  },
  "properties": {
    "id": "1704742857502"
  }
}
	 */
	const serializedPoints = geoSerializeSteps(state)
	const stepBeingSearchedIndex = state.findIndex(
		(step) => step && step.stepBeingSearched
	)
	const result = useMemo(() => {
		const points = state
			.map((step, index) => {
				if (step == null || !(step.latitude && step.longitude)) return
				const { longitude, latitude, allezValue, stepBeingSearched } = step
				return {
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [+longitude, +latitude],
					},
					properties: {
						allezValue,
						letter: letterFromIndex(index),
						stepBeingSearched,
					},
				}
			})
			.filter(Boolean)
		return [serializedPoints, points]
	}, [serializedPoints, stepBeingSearchedIndex])
	return result
}
