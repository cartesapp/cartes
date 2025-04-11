import { useEffect, useState } from 'react'
import { getFetchUrlBase } from '../serverUrls'
import { safeRemove } from './utils'

const point = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [0, 0],
			},
		},
	],
}
export function useAddPanoramaxLayer(map, active, styleKey) {
	useEffect(() => {
		if (!active || !map) return

		map.addSource('geovisio', {
			maxzoom: 15,
			minzoom: 0,
			tiles: ['https://api.panoramax.xyz/api/map/{z}/{x}/{y}.mvt'],
			type: 'vector',
		})

		map.addLayer({
			id: 'geovisio_sequences',
			layout: { 'line-cap': 'square' },
			paint: {
				'line-color': '#FFB57D',
				'line-width': [
					'interpolate',
					['linear'],
					['zoom'],
					0,
					0,
					10,
					1,
					16,
					2,
					22,
					3,
				],
				'line-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0, 7, 1],
			},
			source: 'geovisio',
			'source-layer': 'sequences',
			type: 'line',
			filter: ['==', ['get', 'type'], 'equirectangular'],
		})
		/* we don't use this yet, since it can't be filtered for 360 images
		map.addLayer({
			id: 'geovisio_grid',
			paint: {
				'fill-color': [
					'interpolate-hcl',
					['linear'],
					['get', 'coef'],
					0,
					'#FFCC80',
					0.5,
					'#E65100',
					1,
					'#BF360C',
				],
				'fill-opacity': [
					'interpolate',
					['linear'],
					['zoom'],
					0,
					1,
					4,
					1,
					6,
					0.8,
					6.5,
					0,
				],
			},
			source: 'geovisio',
			'source-layer': 'grid',
			type: 'fill',
		})
		*/
		return () => {
			safeRemove(map)(
				[
					'geovisio_sequences',

					//	'geovisio_grid' See above
				],
				['geovisio']
			)
		}
	}, [map, active, styleKey])
}
export default function useDrawPanoramaxPosition(map, position) {
	const hasPosition = position != null
	const [source, setSource] = useState()
	useEffect(() => {
		if (!map || !hasPosition) return
		const addIcon = async () => {
			const image = await map.loadImage(
				getFetchUrlBase() + '/panoramax-marker.png'
			)
			map.addImage('panoramax-marker', image.data)
			map.addSource('panoramax-marker', {
				type: 'geojson',
				data: null,
			})
			map.addLayer({
				id: 'panoramax-marker',
				type: 'symbol',
				source: 'panoramax-marker',
				layout: {
					'icon-image': 'panoramax-marker',
					'icon-size': 0.15,
				},
			})
			setSource(map.getSource('panoramax-marker'))
		}
		addIcon()

		return () => {
			setSource(null)
			safeRemove(map)(['panoramax-marker'], ['panoramax-marker'])
		}
	}, [map, hasPosition, setSource])

	useEffect(() => {
		if (!map || !source || !position) return

		/*
		point.features[0].geometry.coordinates[0] = position.longitude
		point.features[0].geometry.coordinates[1] = position.latitude
		*/

		//		source.setData(point) //TODO can't make it update, not recreate point. Mmmh maybe it's by design, maplibre makes it jump at high zoom, animate at lower zoom

		map.style && // dunno why it must be checked here
			map.setLayoutProperty('panoramax-marker', 'icon-rotate', position.angle)

		let frames = 0,
			maxFrames = 10 // setting 1000 makes the application lag a lot. Maybe because it triggers redraws of the content section ?

		function animateMarker(timestamp) {
			// Update the data to a new position based on the animation timestamp. The
			// divisor in the expression `timestamp / 1000` controls the animation speed.
			//source.setData(pointOnCircle(timestamp / 1000))

			const coordinates = point.features[0].geometry.coordinates
			const [oldLongitude, oldLatitude] = coordinates
			point.features[0].geometry.coordinates = [
				oldLongitude +
					((position.longitude - oldLongitude) * frames) / maxFrames,
				oldLatitude + ((position.latitude - oldLatitude) * frames) / maxFrames,
			]
			source.setData(point) //TODO can't make it update, not recreate point. Mmmh maybe it's by design, maplibre makes it jump at high zoom, animate at lower zoom

			if (frames < maxFrames) {
				frames += 1
				// Request the next frame of the animation.
				requestAnimationFrame(animateMarker)
			}
		}

		// Start the animation.
		animateMarker(0)
	}, [map, source, position])
}
