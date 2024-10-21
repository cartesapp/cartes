import turfDistance from '@turf/distance'
import { centerOfMass } from '@turf/turf'
import osmToGeojson from 'osmtogeojson'

const apiUrlBase = `https://api.openstreetmap.org/api/0.6`
export const osmRequest = async (featureType, id, full) => {
	console.log('lightgreen will make OSM request', featureType, id, full)
	const request = await fetch(
		`${apiUrlBase}/${featureType}/${id}${full ? '/full' : ''}.json`
	)
	if (!request.ok) return []
	const json = await request.json()

	const elements = json.elements

	if (featureType === 'node' && elements.length === 1) {
		try {
			const tags = elements[0].tags || {}
			// handle this use case https://wiki.openstreetmap.org/wiki/Relation:associatedStreet
			// example : https://www.openstreetmap.org/node/3663795073
			if (tags['addr:housenumber'] && !tags['addr:street']) {
				const relationRequest = await fetch(
					`${apiUrlBase}/node/${id}/relations.json`
				)
				const json = await relationRequest.json()
				const {
					tags: { name, type },
				} = json.elements[0]
				if (type === 'associatedStreet') {
					return [{ ...elements[0], tags: { ...tags, 'addr:street': name } }]
				}
			}
		} catch (e) {
			return elements
		}
	}
	return elements
}

export const disambiguateWayRelation = async (
	presumedFeatureType,
	id,
	referenceLatLng,
	noDisambiguation
) => {
	if (noDisambiguation) {
		const result = await osmRequest(presumedFeatureType, id, false)
		return [result.length ? result[0] : null, presumedFeatureType]
	}
	if (presumedFeatureType === 'node') {
		const result = await osmRequest('node', id, false)
		return [result.length ? result[0] : null, 'node']
	}

	const request1 = await osmRequest('way', id, true)
	const request2 = await osmRequest('relation', id, true)
	if (request1.length && request2.length) {
		// This is naïve, we take the first node, considering that the chances that the first node of the relation and way with same reconstructed id are close to our current location is extremely low
		const node1 = request1.find((el) => el.type === 'node')
		const node2 = request2.find((el) => el.type === 'node')
		if (!node1)
			return [request2.find((el) => el.type === 'relation'), 'relation']
		if (!node2) {
			const way = request1.find((el) => el.type === 'way')
			const enrichedWay = enrichOsmFeatureWithPolyon(way, request1)

			return [enrichedWay, 'way']
		}
		const reference = [referenceLatLng.lng, referenceLatLng.lat]
		const distance1 = turfDistance([node1.lon, node1.lat], reference)
		const distance2 = turfDistance([node2.lon, node2.lat], reference)
		console.log(
			'Ambiguous relation/node id, computing distances : ',
			distance1,
			distance2
		)
		if (distance1 < distance2) {
			const way = request1.find((el) => el.type === 'way')
			const enrichedWay = enrichOsmFeatureWithPolyon(way, request1)

			return [enrichedWay, 'way']
		}
		return [request2.find((el) => el.type === 'relation'), 'relation']
	}

	if (!request1.length && request2.length)
		return [request2.find((el) => el.type === 'relation'), 'relation']
	if (!request2.length && request1.length) {
		const way = request1.find((el) => el.type === 'way')
		const enrichedWay = enrichOsmFeatureWithPolyon(way, request1)

		return [enrichedWay, 'way']
	}

	return [null, null]
}

const buildWayPolygon = (way, elements) => {
	const nodes = way.nodes.map((id) => elements.find((el) => el.id === id)),
		polygon = {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: [nodes.map(({ lat, lon }) => [lon, lat])],
			},
		}
	return polygon
}
// This does not seem to suffice, OSM relations are more complicated than that
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

export const enrichOsmFeatureWithPolyon = (element, elements) => {
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

	const center = centerOfMass(polygon)

	const [lon, lat] = center.geometry.coordinates

	return { ...element, lat, lon, polygon }
}
