/*
 * Note : this function was probably made useless by https://github.com/cartesapp/cartes/pull/948
 *
 * Keeping it for a while, but it's not imported in the web app and saves 30 ko
 */

import { centerOfMass } from '@turf/turf'
import osmToGeojson from 'osmtogeojson'

export default function buildOsmFeatureGeojson(element, elements) {
	if (element.type === 'way') return buildWayPolygon(element, elements)
	if (element.type === 'relation') {
		const featureCollection = osmToGeojson({ elements })
		const firstCurrentlyDrawableFeature = featureCollection.features.find(
			(feature) => ['Polygon', 'MultiPolygon'].includes(feature.geometry.type) // A merge may be necessary, or rather a rewrite of drawquickSearch's addSource ways features to be able to draw any feature including rivers' LineStrings. I don't really know how hard it is
		)
		if (firstCurrentlyDrawableFeature) return firstCurrentlyDrawableFeature

		const message =
			'Tried to enrich wrong OSM type element, or relation has no polygons, only LineStrings for instance, e.g. r2969716, a LineString river. TODO'
		console.error(
			message,
			element.type,
			element,
			osmToGeojson({ elements }).features.map((feature) => feature.geometry)
		)
		//throw new Error(message + ' ' + element.type)
		return centerOfMass(featureCollection)
	}
	throw new Error('Nor a way nor a relation')
}

const buildWayPolygon = (way, elements) => {
	const nodes = way.nodes.map((id) => elements.find((el) => el.id === id))
	const polygon = {
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [[...nodes, nodes[0]].map(({ lat, lon }) => [lon, lat])],
		},
	}
	return polygon
}

// This does not seem to suffice, OSM relations are more complicated than that
//
// so we fallback to a library even if it adds 35 kb for now
/*
const buildRelationMultiPolygon = (relation, elements) => {
	const ways = relation.members
		.filter(({ type, role, ref }) => type === 'way' && role === 'outer')
		.map(({ ref }) => elements.find((el) => el.id === ref))

	const polygon = {
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: ways.map((way) =>
				way.nodes
					.map((id) => elements.find((el) => el.id === id))
					.map(({ lat, lon }) => [lon, lat])
			),
		},
	}
	return polygon
}
*/
