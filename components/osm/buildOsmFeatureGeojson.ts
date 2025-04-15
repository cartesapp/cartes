import osmToGeojson from 'osmtogeojson'

export default function buildOsmFeaturesGeojson(element, elements) {
	const polygon =
		element.type === 'way'
			? buildWayPolygon(element, elements)
			: element.type === 'relation'
			? osmToGeojson({ elements }).features.find(
					(feature) =>
						['Polygon', 'MultiPolygon'].includes(feature.geometry.type) // A merge may be necessary, or rather a rewrite of drawquickSearch's addSource ways features
			  )
			: undefined

	if (polygon === undefined) {
		const message =
			'Tried to enrich wrong OSM type element, or relation has no polygons, only LineStrings for instance, e.g. r2969716, a LineString river. TODO'
		console.error(
			message,
			element.type,
			osmToGeojson({ elements }).features.map((feature) => feature.geometry)
		)
		//throw new Error(message + ' ' + element.type)
		return element
	}

	return polygon
}

const buildWayPolygon = (way, elements) => {
	const nodes = way.nodes.map((id) => elements.find((el) => el.id === id))
	console.log('indigo combined center2', nodes, way, elements)
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
