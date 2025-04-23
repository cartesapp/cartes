import { useDimensions } from '@/components/react-modal-sheet/hooks'
import getBbox from '@turf/bbox'
import { useEffect } from 'react'
import { safeRemove } from '../effects/utils'
import { computeSlopeGradient } from './computeSlopeGradient'

/*
 * Draws the walk or cycle route provided by BRouter directly as Geojson, and
 * also the distance line that sets the context
 * */
export default function useDrawRoute(
	isItineraryMode,
	map,
	geojson,
	id,
	itiPosition = null
) {
	const { width, height } = useDimensions()

	useEffect(() => {
		if (
			!isItineraryMode ||
			!map ||
			!geojson ||
			!geojson.features ||
			!geojson.features.length
		)
			return undefined
		console.log('will draw useDrawRoute inside ' + id, geojson)

		map.addSource(id, {
			type: 'geojson',
			data: geojson,
			lineMetrics: true,
		})

		console.log('useDrawRoute did add source')

		map.addLayer({
			id: id + 'PointsSymbols',
			type: 'symbol',
			source: id,
			filter: ['in', '$type', 'Point'],
			paint: {
				'text-color': '#ffffff', //makes the whole drawing fail...
			},
			layout: {
				'text-field': ['get', 'letter'],
				'text-size': 16,
				'text-font': ['RobotoRegular-NotoSansRegular'],
			},
		})
		console.log('indigo add layer poinst', id + 'Points')
		map.addLayer(
			{
				id: id + 'Points',
				type: 'circle',
				source: id,
				paint: {
					'circle-radius': 12,
					'circle-color': '#2988e6',
					'circle-stroke-color': [
						'case',
						['==', ['get', 'stepBeingSearched'], true],
						'yellow',
						'#ffffff',
					],
					'circle-stroke-width': 3,
				},
				filter: ['in', '$type', 'Point'],
			},
			id + 'PointsSymbols'
		)

		const linestringFilter = ['all', ['in', '$type', 'LineString']]
		map.addLayer(
			{
				id: id + 'Line',
				type: 'line',
				source: id,
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					walking: {
						'line-color': '#8f53c1',
						'line-width': 4,
						// I'm bricoling something here but I don't understand yet how it
						// works precisely
						// TODO I don't get why setting the walking's style from
						// useDrawTransit does not produce the same result here...
						'line-dasharray': {
							stops: [
								[0, [1, 2]],
								[10, [1, 3]],
								[16, [0.6, 4]],
							],
						},
					},
					distance: {
						'line-width': 0,
					},
					car: {
						'line-width': 3,
						'line-color': 'IndianRed',
					},
					cycling: {
						'line-color': '#57bff5',
						'line-width': 2,
						...(id === 'cycling'
							? {
									'line-gradient': [
										'interpolate',
										['linear'],
										['line-progress'],
										...computeSlopeGradient(geojson),
									],
							  }
							: {}),
					},
				}[id],
				filter: linestringFilter,
			},
			'distance' + 'Points'
		)

		console.log('indigo add layer', id)
		map.addLayer(
			{
				id: id + 'Contour',
				type: 'line',
				source: id,
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					walking: {
						'line-color': '#d3b2ee',
						'line-width': 4, // I wasn't able to make a dasharray contour
					},
					distance: {
						'line-width': 2,
						'line-color': '#185abd60',
						'line-dasharray': [8, 8],
					},
					cycling: {
						'line-color': '#5B099F',
						'line-width': 4,
					},
					car: {
						'line-color': 'DarkRed',
						'line-width': 6,
					},
				}[id],
				filter: linestringFilter,
			},
			'distance' + 'Line'
		)

		const bbox = getBbox(geojson)

		if (
			geojson.features.filter(
				(f) => f.geometry.type === 'Point' && f.properties?.key != null
			).length > 1
		) {
			const large = height < width,
				padding = large
					? { left: width / 4, right: width / 4 }
					: { left: 10, right: 10 }

			map.fitBounds(bbox, { padding })
		}

		return () => {
			// There's something I don't understand in MapLibre's lifecycle...
			// "this.style is undefined" when redimensioning the browser window, need
			// to catch it
			// We're operating on a stale style / map
			if (!map) return
			try {
				const baseId = id
				console.log('will try to remove source and layers id ', id)
				safeRemove(map)(
					[
						baseId + 'Line',
						baseId + 'Contour',
						baseId + 'Points',
						baseId + 'PointsSymbols',
					],
					[baseId]
				)
			} catch (e) {
				console.log('Could not remove useDrawRoute layers or source', e)
			}
		}
	}, [isItineraryMode, geojson, map, id])
}
