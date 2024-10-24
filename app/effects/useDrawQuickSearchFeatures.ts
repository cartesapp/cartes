import parseOpeningHours from 'opening_hours'
import { categoryIconUrl } from '../QuickFeatureSearch'
import { useEffect } from 'react'
import buildSvgImage from './buildSvgImage'
import useSetSearchParams from '@/components/useSetSearchParams'
import { encodePlace } from '../utils'
import { buildAllezPart } from '../SetDestination'
import { safeRemove } from './utils'
import { colors } from '@/components/utils/colors'

export default function useDrawQuickSearchFeatures(
	map,
	features,
	showOpenOnly,
	category,
	setOsmFeature = () => null,
	backgroundColor,
	invert = false
) {
	const setSearchParams = useSetSearchParams()
	useEffect(() => {
		if (!map || !features || features.length < 1 || !category) return
		console.log('orange', features)

		const featuresWithOpen = features.map((f) => {
			if (!f.tags || !f.tags.opening_hours) {
				return { ...f, isOpen: null }
			}
			try {
				const oh = new parseOpeningHours(f.tags.opening_hours, {
					address: { country_code: 'fr' },
				})
				return { ...f, isOpen: oh.getState() }
			} catch (e) {
				return { ...f, isOpen: null }
			}
		})

		const shownFeatures = showOpenOnly
			? featuresWithOpen.filter((f) => f.isOpen)
			: featuresWithOpen

		const isOpenByDefault = category['open by default']
		const imageUrl = categoryIconUrl(category)
		buildSvgImage(
			imageUrl,
			(img) => {
				console.log('useDrawQuickSearchFeatures build svg image', shownFeatures)
				const imageName = category.name + '-cartes' // avoid collisions
				const mapImage = map.getImage(imageName)
				if (!mapImage) map.addImage(imageName, img)

				const baseId = `features-${category.name}-`
				console.log('useDrawQuickSearchFeatures add source ')
				console.log(baseId + 'points')
				// Looks like buildSvgImage triggers multiple img.onload calls thus
				// multiple map.addSource, hence an error
				const source = map.getSource(baseId + 'points')
				if (source) return
				map.addSource(baseId + 'points', {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: shownFeatures.map((f) => {
							const geometry = {
								type: 'Point',
								coordinates: [f.lon, f.lat],
							}

							const tags = f.tags || {}
							const isOpenColor = {
								true: '#4ce0a5ff',
								false: '#e95748ff',
								null: isOpenByDefault ? false : 'beige',
							}[f.isOpen]

							return {
								type: 'Feature',
								geometry,
								properties: {
									id: f.id,
									tags,
									name: tags.name,
									featureType: f.type,
									isOpenColor: isOpenColor,
								},
							}
						}),
					},
				})
				map.addSource(baseId + 'ways', {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: shownFeatures
							.filter((f) => f.polygon)
							.map((f) => {
								const tags = f.tags || {}
								const feature = {
									type: 'Feature',
									geometry: !invert
										? f.polygon.geometry
										: // thanks ! https://stackoverflow.com/questions/43561504/mapbox-how-to-get-a-semi-transparent-mask-everywhere-but-on-a-specific-area
										  {
												type: 'Polygon',
												coordinates: [
													[
														[-180, -90],
														[-180, 90],
														[180, 90],
														[180, -90],
														[-180, -90],
													],
													f.polygon.geometry.coordinates[0],
												],
										  },
									properties: {
										id: f.id,
										tags,
										name: tags.name,
									},
								}
								console.log('ocean', feature)
								return feature
							}),
					},
				})

				// Add a symbol layer
				map.addLayer({
					id: baseId + 'ways',
					type: 'fill',
					source: baseId + 'ways',
					layout: {},
					paint: {
						'fill-color': colors['lightestColor'],
						'fill-opacity': 0.6,
					},
				})
				map.addLayer({
					id: baseId + 'ways-outlines',
					type: 'line',
					source: baseId + 'ways',
					layout: {},
					paint: {
						'line-color': colors['color'],
						'line-width': 2,
					},
				})
				map.addLayer({
					id: baseId + 'points',
					type: 'symbol',
					source: baseId + 'points',
					layout: {
						'icon-image': category.name + '-cartes',
						'icon-size': 0.6,
						'text-field': ['get', 'name'],
						'text-offset': [0, 1.25],
						'text-anchor': 'top',
						'text-font': ['Roboto Regular', 'Noto Sans Regular'],
					},
					paint: {
						'text-color': '#503f38',
						'text-halo-blur': 0.5,
						'text-halo-color': 'white',
						'text-halo-width': 1,
					},
				})
				map.addLayer({
					id: baseId + 'points-is-open',
					type: 'circle',
					source: baseId + 'points',
					paint: {
						'circle-radius': 4,
						'circle-color': ['get', 'isOpenColor'],
						'circle-stroke-color': colors['color'],
						'circle-stroke-width': 1.5,
						'circle-translate': [12, -12],
					},
					filter: ['!=', 'isOpenColor', false],
				})

				map.on('click', baseId + 'points', async (e) => {
					const feature = e.features[0]
					const { lng: longitude, lat: latitude } = e.lngLat
					const properties = feature.properties,
						tagsRaw = properties.tags
					console.log('quickSearchOSMfeatureClick', feature)
					const tags =
						typeof tagsRaw === 'string' ? JSON.parse(tagsRaw) : tagsRaw

					setSearchParams({
						allez: buildAllezPart(
							tags?.name || 'sans nom',
							encodePlace(properties.featureType, properties.id),
							longitude,
							latitude
						),
					})

					const osmFeature = { ...properties, tags }
					console.log(
						'will set OSMfeature after quickSearch marker click, ',
						osmFeature
					)
					setOsmFeature(osmFeature)
				})
				map.on('mouseenter', 'features-points', () => {
					map.getCanvas().style.cursor = 'pointer'
				})
				// Change it back to a pointer when it leaves.
				map.on('mouseleave', 'features-points', () => {
					map.getCanvas().style.cursor = 'auto'
				})
			},
			backgroundColor
		)

		return () => {
			// TODO for whatever reason to be found, features are not removed until
			// the request is finished
			const baseId = `features-${category.name}-`
			safeRemove(map)(
				[
					baseId + 'points',
					baseId + 'points-is-open',
					baseId + 'ways-outlines',
					baseId + 'ways',
				],
				[baseId + 'points', baseId + 'ways']
			)
		}
	}, [features, map, showOpenOnly, category])
}
