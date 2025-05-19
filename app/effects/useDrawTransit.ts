import { useEffect } from 'react'
import { handleColor } from '@/app/itinerary/transit/colors'
import { findContrastedTextColor } from '@/components/utils/colors'
import { safeRemove } from './utils'
import { filterNextConnections } from '../itinerary/transit/utils'
import bezierSpline from '@turf/bezier-spline'
import { lineString } from '@turf/turf'
import mapboxPolyline from '@mapbox/polyline'
import { notTransitType } from '../itinerary/transit/motisRequest'

export default function useDrawTransit(map, transit, selectedConnection, date) {
	console.log('useDrawTransit', transit)
	const connections =
		transit &&
		transit.itineraries &&
		filterNextConnections(transit.itineraries, date)

	const connection = connections && connections[selectedConnection || 0]

	useEffect(() => {
		if (!map || !connection) return

		const { legs } = connection

		const featureCollection = {
			type: 'FeatureCollection',
			features: legs
				.reduce((memo, next) => {
					const routeTextColor = handleColor(next.routeTextColor, '#000000')
					console.log('next', next)

					const geometry = mapboxPolyline.toGeoJSON(next.legGeometry.points, 6)
					window.mapboxPolyline = mapboxPolyline

					return [
						...memo,
						{
							geometry,
							type: 'Feature',
							properties: {
								name: next.routeShortName || '',
								mode: next.mode,
								isTransit: !notTransitType.includes(next.mode) ? 'Yes' : 'No',
								route_color: handleColor(next.routeColor) || '#d3b2ee',
								route_color_darker: next.routeColorDarker || '',
								route_text_color: routeTextColor,
								inverse_color: findContrastedTextColor(routeTextColor, true),
								stopsCount:
									next.intermediateStops && next.intermediateStops.length + 2,
							},
						},
					]
				}, [])
				.map((feature) => {
					const coordinates = feature.geometry.coordinates
					if (
						coordinates.length <= 2 ||
						coordinates.length > feature.properties.stopsCount * 1.5 // testing here if the polyline is a GTFS real route or not
					)
						return feature

					var curved = bezierSpline(lineString(coordinates), {
						sharpness: 0.6,
						resolution: 10000,
					})

					console.log('banana', curved.geometry.coordinates.length)

					return {
						...feature,
						geometry: {
							...feature.geometry,
							coordinates: curved.geometry.coordinates,
						},
					}
				})
				.filter(Boolean),
		}
		console.log('useDrawTransit fc', featureCollection)
		const id = 'transit-' + Math.random()
		console.log('indigo random', id)

		try {
			const source = map.getSource(id)

			if (source) return
		} catch (e) {
			console.log('Could not test source presence in useDrawTransit', e)
		}
		console.log('will (re)draw transport route geojson')
		map.addSource(id, { type: 'geojson', data: featureCollection })

		console.log('indigo add layer poinst', id)
		map.addLayer({
			source: id,
			type: 'line',
			id: id + '-lines-contour',
			filter: ['==', ['get', 'isTransit'], 'Yes'],
			layout: {
				'line-join': 'round',
				'line-cap': 'round',
			},
			paint: {
				'line-color': ['get', 'route_color_darker'],
				'line-width': [
					'interpolate',
					['linear', 1],
					['zoom'],
					3,
					0.4,
					12,
					7,
					18,
					18,
				],
			},
		})
		map.addLayer({
			source: id,
			type: 'line',
			id: id + '-lines',
			filter: ['==', ['get', 'isTransit'], 'Yes'],

			layout: {
				'line-join': 'round',
				'line-cap': 'round',
			},
			paint: {
				'line-color': ['get', 'route_color'],
				'line-width': [
					'interpolate',
					['linear', 1],
					['zoom'],
					3,
					0.3,
					12,
					4,
					18,
					12,
				],
			},
		})

		map.addLayer({
			id: id + '-lines-symbols',
			type: 'symbol',
			source: id,
			layout: {
				'symbol-placement': 'line',
				'text-font': ['RobotoBold-NotoSansBold'],
				'text-field': '{name}', // part 2 of this is how to do it
				'text-transform': 'uppercase',
				'text-size': 16,
			},
			paint: {
				'text-color': ['get', 'route_text_color'],
				'text-halo-blur': 1,
				'text-halo-color': ['get', 'inverse_color'],
				'text-halo-width': 1,
			},
		})
		map.addLayer(
			{
				source: id,
				type: 'line',
				id: id + '-lines-walking-background',
				filter: ['==', ['get', 'mode'], 'Walk'],
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					'line-color': '#d3b2ee',
					'line-width': 4,
				},
			},
			'distancePoints'
		)
		map.addLayer(
			{
				source: id,
				type: 'line',
				id: id + '-lines-walking',
				filter: ['==', ['get', 'mode'], 'WALK'],
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					'line-color': '#8f53c1',
					'line-width': 4,
					'line-dasharray': [1, 2],
				},
			},
			'distancePoints'
		)
		map.addLayer({
			source: id,
			type: 'circle',
			id: id + '-points',
			filter: ['in', '$type', 'Point'],
			paint: {
				'circle-radius': [
					'interpolate',
					['linear', 1],
					['zoom'],
					0,
					0.1,
					12,
					1,
					18,
					10,
				],
				'circle-color': 'white',
				'circle-pitch-alignment': 'map',
				'circle-stroke-color': ['get', 'route_color'],
				'circle-stroke-width': [
					'interpolate',
					['linear', 1],
					['zoom'],
					0,
					0.1,
					12,
					1,
					18,
					4,
				],
			},
		})

		return () => {
			safeRemove(map)(
				[
					id + '-lines',
					id + '-lines-symbols',
					id + '-lines-walking',
					id + '-lines-walking-background',
					id + '-lines-contour',
					id + '-points',
				],
				[id]
			)
		}
	}, [map, connection])
}
