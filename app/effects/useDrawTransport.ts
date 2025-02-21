import useSetSearchParams from '@/components/useSetSearchParams'
import { useEffect } from 'react'
import { safeRemove } from './utils'
import { area, convex } from '@turf/turf'
import bboxPolygon from '@turf/bbox-polygon'

/***
 * This hook draws transit lines on the map.
 */
export default function useDrawTransport(
	map,
	features,
	drawKey,
	hasItinerary,
	bbox
) {
	const setSearchParams = useSetSearchParams()

	const id = 'transport-routes-' + drawKey
	const linesId = id + '-lines'
	const pointsId = id + '-points'

	useEffect(() => {
		if (!map || !features?.length) return
		if (hasItinerary) console.log('plopouille', hasItinerary, linesId)
		try {
			const hasItineraryOpacity = 0.4
			// setTimeout because it seems that useDrawTransport is drawn before
			// useDrawTransit
			setTimeout(() => {
				map.setPaintProperty(
					linesId,
					'line-opacity',
					hasItinerary ? hasItineraryOpacity : 1
				)
				map.setPaintProperty(
					pointsId,
					'circle-opacity',
					hasItinerary ? hasItineraryOpacity : 1
				)
			}, 1000)
		} catch (e) {
			console.log(
				'Error setting transport lines opacity when itinerary is on',
				e
			)
		}
	}, [hasItinerary, map, linesId])

	useEffect(() => {
		if (!map || !features?.length) return

		const featureCollection = {
			type: 'FeatureCollection',
			features,
		}

		const onClickRoutes = (e) => {
			console.log(
				'purple',
				e.features.map(
					({ properties }) =>
						properties.route_long_name + '   ' + properties.sncfTrainType
				)
			)

			setSearchParams({
				'choix du style': undefined,
				routes: e.features
					.map((feature) => feature.properties.route_id)
					.join('|'),
			})
		}
		const onClickStop = (e) => {
			console.log('purple stop', e.features)
			const feature = e.features[0],
				agence = feature.properties.agencyId,
				arret = feature.properties.name
			//stopId = feature.properties.id,
			//, gare = stopId.split('-').slice(-1)[0]

			setSearchParams({
				//agence, not sure why we should filter by agency here ?
				arret,
			})
		}
		/*
		const areasId = id + 'areas'
		const areasSource = map.getSource(areasId)
		if (areasSource) return
		if (areaKm2 > 3000) return

		const areas = convex(featureCollection)
		*/
		try {
			const source = map.getSource(id)
			if (source) return

			map.addSource(id, { type: 'geojson', data: featureCollection })

			map.addLayer({
				source: id,
				type: 'line',
				id: linesId,
				filter: ['all', ['in', '$type', 'LineString'], ['has', 'route_color']],
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					// In Rennes, one crazy bus network is the football stadium route, code E4
					// Since the agency did not give it colors, it's hard to draw it on a map
					// Moreover, it should be handled as an exceptional bus, not a regular one
					// This is easy to check through the data, see that it runs only on selected
					// days / hours and display it to the user TODO
					'line-color': ['get', 'route_color'],
					//'line-opacity': ['get', 'opacity'],
					'line-width': [
						'interpolate',
						['linear', 1],
						['zoom'],
						3,
						['*', ['get', 'width'], 0.2],
						12,
						['*', ['get', 'width'], 2.5],
						18,
						['*', ['get', 'width'], 20],
					],
				},
			})
			map.addLayer({
				source: id,
				type: 'circle',
				id: pointsId,
				filter: ['in', '$type', 'Point'],
				paint: {
					'circle-radius': [
						'interpolate',
						['linear', 1],
						['zoom'],
						0,
						['*', 0.1, ['get', 'width']],
						6,
						['*', 7, ['get', 'width']],
						12,
						['*', 20, ['get', 'width']],
						18,
						['*', 50, ['get', 'width']],
					],
					'circle-stroke-width': [
						'interpolate',
						['linear', 1],
						['zoom'],
						0,
						['*', 0.1, ['get', 'width']],
						6,
						['*', 1.5, ['get', 'width']],
						12,
						['*', 5, ['get', 'width']],
						18,
						['*', 10, ['get', 'width']],
					],
					'circle-stroke-color': ['get', 'circle-stroke-color'],

					'circle-pitch-alignment': 'map',
					'circle-color': ['get', 'circle-color'],
				},
			})
			console.log('transportmap did add layer id ', pointsId, map._mapId)

			map.on('click', linesId, onClickRoutes)
			map.on('click', pointsId, onClickStop)

			map.on('mouseenter', linesId, () => {
				map.getCanvas().style.cursor = 'pointer'
			})
			// Change it back to a pointer when it leaves.
			map.on('mouseleave', linesId, () => {
				map.getCanvas().style.cursor = ''
			})
		} catch (e) {
			console.log('Caught error drawing useDrawTransport', e)
		}

		return () => {
			if (!map || !features?.length) return
			map.off('click', linesId, onClickRoutes)
			map.off('click', pointsId, onClickStop)
			safeRemove(map)([linesId, pointsId], [id])
		}
	}, [map, features, drawKey, bbox])
}
