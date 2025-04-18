import { buildAllezPart } from '@/app/SetDestination'
import { clickableClasses } from '@/app/clickableLayers'
import { createPolygon, createSearchBBox } from '@/app/createSearchPolygon'
import disambiguateWayRelation from '@/components/osm/disambiguateWayRelation'
import { encodePlace } from '@/app/utils'
import { replaceArrayIndex } from '@/components/utils/utils'
import { useEffect } from 'react'
import { nameExpression } from '../styles/france'
import handleCirconscriptionsLegislativesClick from './handleCirconscriptionsLegislativesClick'
import { buildOsmFeatureCategory } from '@/components/osm/buildDescription'

export default function useMapClick(
	map,
	state,
	setState,
	drawMode,
	itinerary,
	isTransportsMode,
	setLatLngClicked,
	gares,
	clickGare,
	setSearchParams,
	styleKey,
	styleChooserOpen,
	setChargement
) {
	// This hook lets the user click on the map to find OSM entities
	// It also draws a polygon to show the search area for pictures
	// (not obvious for the user though)
	useEffect(() => {
		if (isTransportsMode) return

		const onClick = async (e) => {
			// interesting and tricky : without this timeout, it looks like another
			// setSearchParams overrides this call

			if (styleChooserOpen)
				setTimeout(() => setSearchParams({ 'choix du style': undefined }), 100)

			setLatLngClicked(e.lngLat)

			const source = map.getSource('searchPolygon')
			const polygon = createPolygon(createSearchBBox(e.lngLat))

			if (source) {
				source.setData(polygon.data)
				map && map.setPaintProperty('searchPolygon', 'fill-opacity', 0.6)
			} else {
				map.addSource('searchPolygon', polygon)

				map.addLayer({
					id: 'searchPolygon',
					type: 'fill',
					source: 'searchPolygon',
					layout: {},
					paint: {
						'fill-color': '#57bff5',
						'fill-opacity': 0.6,
					},
				})
			}

			setTimeout(() => {
				map && map.setPaintProperty('searchPolygon', 'fill-opacity', 0)
			}, 1000)

			const allowedLayerProps = ({ properties: { class: c }, sourceLayer }) =>
				sourceLayer === 'poi' ||
				(['place', 'waterway'].includes(sourceLayer) &&
					clickableClasses.includes(c)) // Why ? because e.g. "state" does not map to an existing OSM id in France at least, see https://github.com/openmaptiles/openmaptiles/issues/792#issuecomment-1850139297
			// TODO when "state" place, make an overpass request with name, since OMT's doc explicitely says that name comes from OSM

			// Thanks OSMAPP https://github.com/openmaptiles/openmaptiles/issues/792
			const rawFeatures = map.queryRenderedFeatures(e.point),
				features = rawFeatures.filter(
					(f) =>
						(f.source === 'openmaptiles' ||
							f.source === 'maptiler_planet' ||
							f.source === 'indoorequal') && // maintain compatibility with two of our styles : the new protomaps style and the old maptiler styles
						allowedLayerProps(f)
				)

			const circo = handleCirconscriptionsLegislativesClick(rawFeatures)

			if (circo) return setSearchParams({ ...circo })

			const interesting = rawFeatures.filter(
				(feature) => feature.source !== 'searchPolygon'
			)
			console.log(
				'clicked map features',
				interesting && interesting[0],
				interesting
			)

			if (!features.length || !features[0].id) {
				console.log('clicked no features', features)
				return setSearchParams({ allez: undefined })
			}

			const feature = features[0]
			const openMapTilesId = '' + feature.id

			const hasNwr = styleKey === 'france'
			// e.g. For "Vitré", a town, I'm getting id 18426612010. The final 0 means
			// "node", it needs to be stripped. For a waterway like La Vilaine in
			// Vitré https://www.openstreetmap.org/way/308377384, the OpenMapTiles id
			// is the good one.
			//

			const isIndoorequalFeature =
				feature.properties?.level &&
				typeof feature.properties?.id === 'string' && // some items have a level field but does not come from indoorequal
				feature.properties?.id.match(/^(node|way|relation):\d+$/)

			const id = isIndoorequalFeature
					? isIndoorequalFeature[0].split(':')[1]
					: hasNwr
					? feature.id
					: ['waterway'].includes(feature.sourceLayer)
					? openMapTilesId
					: openMapTilesId.slice(null, -1),
				featureType = isIndoorequalFeature
					? isIndoorequalFeature[1]
					: hasNwr
					? { w: 'way', n: 'node', r: 'relation' }[
							feature.properties?.nwr || 'r'
					  ]
					: feature.sourceLayer === 'waterway'
					? 'way' // bold assumption here
					: feature.sourceLayer === 'place'
					? 'node'
					: { '1': 'way', '0': 'node', '4': 'relation' }[ //this is broken. We're getting the "4" suffix for relations AND ways. See https://github.com/openmaptiles/openmaptiles/issues/1587. See below for hack
							openMapTilesId.slice(-1)
					  ]
			console.log('clicked ', id, featureType, feature)
			if (!featureType) {
				console.log('clicked Unknown OSM feature type from OpenMapTiles ID')
				return setSearchParams({ allez: undefined })
			}

			const nameFound =
					feature.properties &&
					[...nameExpression, ['get', 'name']].find(
						([_, k]) => feature.properties[k]
					),
				name = nameFound && feature.properties[nameFound[1]]

			console.log('clicked name ', name)

			setChargement({ osmCode: encodePlace(featureType, id), name })
			console.log('clicked name did set chargement', name)

			const noDisambiguation = hasNwr

			console.log('indigo will disambiguate', featureType, id, noDisambiguation)
			const [element, realFeatureType] = await disambiguateWayRelation(
				featureType,
				id,
				e.lngLat,
				noDisambiguation
			)

			console.log('indigo clicked element ', element)
			if (element) {
				console.log('reset OSMfeature after click on POI')
				const { lng: longitude, lat: latitude } = e.lngLat
				const newState = replaceArrayIndex(state, -1, element, 'merge')

				console.log('lightgreen new state after map click', element, newState)
				setState(newState)

				const osmFeatureCategory = buildOsmFeatureCategory(element)
				// We store longitude and latitude in order to, in some cases, avoid a
				// subsequent fetch request on link share
				setSearchParams({
					allez: buildAllezPart(
						element.tags?.name || osmFeatureCategory || 'sans nom',
						encodePlace(realFeatureType, id),
						longitude,
						latitude
					),
				})
				console.log('sill set OSMFeature', element)
				// wait for the searchParam update to proceed
			}
		}

		if (!map || drawMode || itinerary.isItineraryMode) return

		map.on('click', onClick)
		return () => {
			if (!map) return
			map.off('click', onClick)
		}
	}, [
		map,
		drawMode,
		itinerary.isItineraryMode,
		gares,
		clickGare,
		isTransportsMode,
		setSearchParams,
		setLatLngClicked,
		styleKey,
		styleChooserOpen,
	])
}
