import { useEffect } from 'react'
import { Marker, LngLatBounds } from 'maplibre-gl'

import dpeColors from './DPE.yaml'
import { pointToRectangle } from '../geoUtils'

const pointsToPolygons = (featureCollection) => {
	const { features } = featureCollection

	const polygons = features.map((feature) => {
		const { properties } = feature

		const polygon = pointToRectangle(
			feature,
			Math.sqrt(properties.surface) / 2,
			0.7
		)

		return { ...polygon, properties }
	})
	//console.log('indigo surf', polygons)
	return { ...featureCollection, features: [...polygons, ...features] }
}

const iconSize = '30'

export default function DPEMarkers({ map, featureCollection, selectMarker }) {
	console.log('indigo fc', featureCollection)
	useEffect(() => {
		if (!featureCollection?.features?.length) return

		const draw = async () => {
			if (map.getSource('dpe')) return
			map.addSource('dpe', {
				type: 'geojson',
				data: pointsToPolygons(featureCollection),
			})

			map.addLayer({
				id: '3d-dpe',
				source: 'dpe',
				//'source-layer': 'building',
				type: 'fill-extrusion',
				minzoom: 15,
				filter: ['in', '$type', 'Polygon'],
				paint: {
					'fill-extrusion-color': ['get', 'color'],
					/*
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            16,
            ['get', 'height'],
          ],
		  */
					'fill-extrusion-height': ['get', 'top'],
					'fill-extrusion-base': ['get', 'base'],
				},
			})

			map.addLayer(
				{
					id: 'discs',
					type: 'circle',
					source: 'dpe',
					paint: {
						'circle-radius': 12,
						'circle-color': ['get', 'color'],
						'circle-stroke-color': 'black',
						'circle-stroke-width': 2,
					},
					filter: ['in', '$type', 'Point'],
				}
				// '3d-dpe',
			)

			// Add a symbol layer
			map.addLayer(
				{
					id: 'dpe-markers',
					type: 'symbol',
					source: 'dpe',
					filter: ['in', '$type', 'Point'],
					layout: {
						// get the year from the source's "year" property
						'text-field': ['get', 'etiquette'],
						//'text-field': 'Z',
						'text-font': ['RobotoRegular-NotoSansRegular'],
						'text-anchor': 'center',
					},
					paint: {
						'text-color': 'black',
					},
				}
				//'discs',
			)
			map.on('click', 'discs', (e) => {
				if (!e.features?.length) return
				const feature = e.features[0]
				selectMarker(feature.properties)
			})

			map.on('click', 'dpe-markers', (e) => {
				if (!e.features?.length) return
				const feature = e.features[0]
				selectMarker(feature.properties)
			})
		}

		draw()
		return () => {
			try {
				map.off('click', 'discs', selectMarker)
				map.off('click', 'dpe-markers', selectMarker)

				map.removeLayer('dpe-markers')
				map.removeLayer('3d-dpe')
				map.removeLayer('discs')
				map.removeSource('dpe')
			} catch (e) {
				console.log(e)
			}
		}
		return
		const bounds = new LngLatBounds()
		const markers = data.map((feature, i) => {
			const { Etiquette_DPE: etiquette } = feature

			const color = dpeColors.find((dpe) => dpe.lettre === etiquette).couleur

			// create a DOM element for the marker
			const el = document.createElement('div')
			el.className = 'marker'
			el.style.width = `${iconSize}px`
			el.style.height = `${iconSize}px`
			el.innerHTML = `<svg width="${iconSize}px" height="${iconSize}px" version="1.1" viewBox="0 0 210 210" xmlns="http://www.w3.org/2000/svg">
<circle cx="105.34" cy="105.23" r="99.149" fill="${color}"/>
<text x="103.11399" y="158.85912" font-family="Ubuntu" font-size="176.39px" font-weight="bold" text-align="center" text-anchor="middle" ><tspan x="103.11399" y="158.85912" fill="#ffffff" font-size="176.39px" stroke-width="4">${feature.lettre}</tspan></text>
</g>
</svg>`

			el.addEventListener('click', () => {
				selectMarker(feature)
			})

			const marker = new Marker({ element: el })
				.setLngLat(feature.geometry.coordinates)
				.addTo(map)

			bounds.extend(feature.geometry.coordinates)
			return marker
		})

		map.fitBounds(bounds, { maxZoom: 17 })
		return () => {
			markers.map((marker) => marker.remove())
		}
	}, [
		map,
		featureCollection?.features?.map((f) => f.properties['N°DPE']).join('|'),
		selectMarker,
	])
	return <div></div>
}
