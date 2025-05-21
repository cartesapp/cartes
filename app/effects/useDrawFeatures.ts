import useSetSearchParams from '@/components/useSetSearchParams'
import { colors } from '@/components/utils/colors'
import parseOpeningHours from 'opening_hours'
import { useEffect, useState } from 'react'
import { buildAllezPart } from '../SetDestination'
import { decodePlace, encodePlace } from '../utils'
import buildSvgImage from './buildSvgImage'
import { safeRemove } from './utils'

export default function useDrawFeatures(
	map,
	features,
	showOpenOnly,
	category,
	setOsmFeature = () => null,
	backgroundColor = colors['color'],
	invert = false
) {
	const setSearchParams = useSetSearchParams()
	const baseId = `features-${category.name}-`

	const [sources, setSources] = useState(null)

	const hasFeatures = features && features.length > 0

	useEffect(() => {
		// on annule si la carte ou les features sont manquants
		if (!map) return
		if (!hasFeatures) return

		// on reconstruit le nom de l'icone : l'alias si précisé, sinon le nom du svg
		const imageFilename = category.icon
		const imageFinalFilename = category['icon alias']
		const iconName = imageFinalFilename || imageFilename
		// et le nom avec lequel l'image a été ajoutée dans maplibre
		const mapImageName = 'cartesapp-' + iconName // avoid collisions

		const mapImage = map.getImage(mapImageName)
		let unsubscribeEvents = () => null
		if (mapImage)
			unsubscribeEvents = draw(
				map,
				baseId,
				setSearchParams,
				setSources,
				mapImageName,
				setOsmFeature,
				category
			)
		else {
			buildSvgImage(
				imageFilename,
				imageFinalFilename,
				(img) => {
					map.addImage(mapImageName, img)

					unsubscribeEvents = draw(
						map,
						baseId,
						setSearchParams,
						setSources,
						mapImageName,
						setOsmFeature,
						category
					)
				},
				backgroundColor,
				category.iconSize
			)
		}

		// for cleaning ?
		const cleanup = () => {
			unsubscribeEvents && unsubscribeEvents()
			safeRemove(map)(
				[
					baseId + 'points',
					baseId + 'points-is-open',
					baseId + 'lines',
					baseId + 'polygons',
				],
				[baseId + 'points', baseId + 'lines', baseId + 'polygons']
			)
		}

		return cleanup
	}, [map, category, baseId, setSources, setOsmFeature, hasFeatures])

	useEffect(() => {
		// on annule si carte ou sources ou features pas encore chargés
		if (!map) return
		if (!sources) return
		// je crois que cette condition était problématique et l'enlever n'a que des
		// avantages
		//if (!features?.length) return

		const isOpenByDefault = category['open by default']
		const featuresWithOpen = (features || []).map((f) => {
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

		// merge feature centers (from nodes, ways, and relations) in a FeatureCollection
		const pointsData = {
			type: 'FeatureCollection',
			features: shownFeatures
				.map((feature) => {
					if (!feature.center) return null
					const tags = feature.tags || {}
					const isOpenColor = {
						true: '#4ce0a5ff',
						false: '#e95748ff',
						null: isOpenByDefault ? false : 'beige',
					}[feature.isOpen]

					const [featureType, id] = decodePlace(feature.osmCode)
					const { geometry } = feature.center
					return {
						type: 'Feature',
						geometry,
						properties: {
							id,
							tags,
							name: tags.name,
							featureType,
							isOpenColor: isOpenColor,
						},
					}
				})
				.filter(Boolean),
		}

		// shownFeatures is an array of OverpassElement
		// but for relations, geojson in already a FeatureCollection
		// we need to flat its features with the other Feature from nodes and ways
		const shownFeaturesFlat = shownFeatures
			.map((f) => {
				if (f.geojson && f.geojson.type == 'FeatureCollection') {
					return f.geojson.features.map((g) => {
						return { ...f, geojson: g }
					})
				}
				return f
			})
			.flat()
		// TODO among relation membres, we only display ways, nut not individual nodes
		// it would be great to handle this for housenumber nodes in an associatedStreet relation

		// merge features of LineString and Polygon geometry (from both ways and relations)
		// in a FeatureCollection to display lines
		const linesData = {
			type: 'FeatureCollection',
			features: shownFeaturesFlat
				.map((f) => {
					const shape = f.polygon || f.geojson // why f.polygon ?
					if (!shape) return null
					if (shape.geometry.type == 'Point') return null
					const tags = f.tags || {}
					const feature = {
						type: 'Feature',
						geometry: shape.geometry,
						properties: {
							id: f.id,
							tags,
							name: tags.name,
						},
					}
					return feature
				})
				.filter(Boolean),
		}
		// merge features of Polygon geometry (from both ways and relations)
		// in a FeatureCollection to display polygons
		const polygonsData = {
			type: 'FeatureCollection',
			features: shownFeaturesFlat
				.map((f) => {
					const shape = f.polygon || f.geojson
					if (!shape) return null
					if (shape.geometry.type != 'Polygon') return null
					const tags = f.tags || {}
					const feature = {
						type: 'Feature',
						geometry: !invert
							? shape.geometry
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
										shape.geometry.coordinates[0],
									],
							  },
						properties: {
							id: f.id,
							tags,
							name: tags.name,
						},
					}
					return feature
				})
				.filter(Boolean),
		}
		sources.polygons.setData(polygonsData)
		sources.lines.setData(linesData)
		sources.points.setData(pointsData)
	}, [category, features, showOpenOnly, sources])
}

const draw = (
	map,
	baseId,
	setSearchParams,
	setSources,
	mapImageName,
	setOsmFeature,
	category
) => {
	if (map.getSource(baseId + 'points')) return
	console.log('chartreuse draw ', baseId + 'points')

	// prepare the sources that will contain the point/line/polygon geometries from Overpass
	const geojsonPlaceholder = { type: 'FeatureCollection', features: [] }
	map.addSource(baseId + 'points', {
		type: 'geojson',
		data: geojsonPlaceholder,
	})
	map.addSource(baseId + 'lines', {
		type: 'geojson',
		data: geojsonPlaceholder,
	})
	map.addSource(baseId + 'polygons', {
		type: 'geojson',
		data: geojsonPlaceholder,
	})
	setSources({
		points: map.getSource(baseId + 'points'),
		lines: map.getSource(baseId + 'lines'),
		polygons: map.getSource(baseId + 'polygons'),
	})

	// add the layers that will display the sources
	// - polygons
	map.addLayer({
		id: baseId + 'polygons',
		type: 'fill',
		source: baseId + 'polygons',
		layout: {},
		paint: {
			'fill-color': colors['lightestColor'],
			'fill-opacity': 0.3,
		},
	})
	// - lines
	map.addLayer({
		id: baseId + 'lines',
		type: 'line',
		source: baseId + 'lines',
		layout: {},
		paint: {
			'line-color': colors['color'],
			'line-width': 2,
		},
	})
	// - points, for markers
	map.addLayer({
		id: baseId + 'points',
		type: 'symbol',
		source: baseId + 'points',
		layout: {
			'icon-image': mapImageName, // use the image which has already been added for tiles
			'icon-size': 1,
			'text-field': ['get', 'name'],
			'text-offset': [0, 1.25],
			'text-font': ['RobotoBold-NotoSansBold'],
			'text-size': 15,
			// text and icon offset : different for pin icon than for other circle icons
			'text-anchor': category.icon === 'pins' ? 'center' : 'top',
			'icon-offset': category.icon === 'pins' ? [0, -18] : [0, 0], //center on pin bottom point
		},
		paint: {
			'text-color': '#503f38',
			'text-halo-blur': 0.5,
			'text-halo-color': 'white',
			'text-halo-width': 1,
			//
			'icon-halo-color': 'white',
			'icon-halo-width': 40,
			'icon-halo-blur': 10,
		},
	})
	// - small circles, to display if the place is open or not
	map.addLayer({
		id: baseId + 'points-is-open',
		type: 'circle',
		source: baseId + 'points',
		paint: {
			'circle-radius': 4,
			'circle-color': ['get', 'isOpenColor'],
			'circle-stroke-color': colors['color'],
			'circle-stroke-width': 1.5,
			// translate : different for pin icon than for other circle icons
			'circle-translate': category.icon === 'pins' ? [12, -36] : [12, -12],
		},
		filter: ['!=', 'isOpenColor', false],
	})

	// gestion des actions en cas de clic sur un POI (l'icone ou le cercle d'ouverture)
	const onClickHandler = async (e) => {
		//on teste si le clic a eu lieu dans l'un des 2 layers possibles, sinon on arrête
		const features = map.queryRenderedFeatures(e.point, {
			layers: [baseId + 'points', baseId + 'points-is-open'],
		})
		if (!features.length) return
		console.log('point trouvé au clic dans ' + baseId)

		// on charge les infos sur le POI
		const feature = features[0]
		const { lng: longitude, lat: latitude } = e.lngLat
		const properties = feature.properties,
			tagsRaw = properties.tags
		console.log('quickSearchOSMfeatureClick', feature)
		const tags = typeof tagsRaw === 'string' ? JSON.parse(tagsRaw) : tagsRaw

		// on change l'URL affichée dans le navigateur
		setTimeout(
			() =>
				setSearchParams({
					allez: buildAllezPart(
						tags?.name || 'sans nom',
						encodePlace(properties.featureType, properties.id),
						longitude,
						latitude
					),
				}),
			200
		)

		//TODO not sure this works with our osmFeature refacto
		// on charge les données et on les affiche ?
		const osmFeature = { ...properties, tags }
		console.log(
			'will set OSMfeature after quickSearch marker click, ',
			osmFeature
		)
		setOsmFeature(osmFeature)
	}
	map.on('click', onClickHandler)

	// change pointer when entering or leaving a POI
	map.on('mouseenter', baseId + 'points', () => {
		map.getCanvas().style.cursor = 'pointer'
	})
	map.on('mouseleave', baseId + 'points', () => {
		map.getCanvas().style.cursor = ''
	})
	map.on('mouseenter', baseId + 'points-is-open', () => {
		map.getCanvas().style.cursor = 'pointer'
	})
	map.on('mouseleave', baseId + 'points-is-open', () => {
		map.getCanvas().style.cursor = ''
	})

	return () => {
		map.off('click', onClickHandler)
		//not unsubscribing other events because they do not trigger an error
		//TODO why ? do they work ?
	}
}
