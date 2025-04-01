import turfDistance from '@turf/distance'
import { centerOfMass } from '@turf/turf'
import osmToGeojson from 'osmtogeojson'
import { isServer } from './serverUrls'
import osmApiRequest from '@/components/osm/osmApiRequest'

export const overpassRequestSuffix =
	'https://overpass-api.de/api/interpreter?data='

const buildOverpassUrl = (
	featureType: 'node' | 'way' | 'relation',
	id: string,
	full = false,
	relations = false,
	meta = false
) =>
	`${overpassRequestSuffix}${encodeURIComponent(
		`[out:json];${featureType}(id:${id});${
			full ? '(._;>;);' : relations ? '<;' : ''
		}out body${meta ? ` meta` : ''};`
	)}`

export const combinedOsmRequest = async (queries) => {
	const requestBody = queries
		.map((result) => {
			const { osmId, featureType, latitude, longitude } = result

			return `${featureType}(id:${osmId}); out body; `
		})
		.join('')

	const requestString = `[out:json];${requestBody}`
	const url = overpassRequestSuffix + encodeURIComponent(requestString)
	console.log('OVERPASS1', url)
	const request = await fetch(url, {
		next: { revalidate: 5 * 60 },
	})

	const json = await request.json()

	const { elements } = json

	const results = queries
		.map((query) => {
			const found = elements.find(
				(element) =>
					query.osmId === element.id && query.featureType === element.type
			)

			if (!found) return false
			const geoElement = {
				...found,
				lat: query.latitude,
				lon: query.longitude,
			}
			return geoElement
		})
		.filter(Boolean)
	console.log('requestString', requestString, results)

	//TODO we don't handle housenumbers like in osmRequest, not sure we need this
	//in this combinedOsmRequest function that is used to enrich photon search
	//results with OSM tags
	return results
}

export const overpassFetchOptions = isServer
	? {
			headers: {
				'User-Agent': 'Cartes.app',
			},
			next: { revalidate: 5 * 60 },
	  }
	: { cache: 'force-cache' }

export const osmRequest = async (featureType, id, full) => {
	console.log(
		'lightgreen will make OSM request',
		featureType,
		id,
		'full : ',
		full
	)

	const directElement = await osmApiRequest(featureType, id)

	if (
		directElement &&
		directElement !== 404 &&
		!directElement.failedServerOsmRequest
	) {
		const {
			properties: { tags },
			geometry: { type, coordinates },
		} = directElement

		if (type === 'Point') {
			console.log('lightgreen success with OSM API')
			return [
				{
					...directElement,
					type: directElement.properties.featureType,
					lon: coordinates[0],
					lat: coordinates[1],
					tags,
					name: tags && tags.name,
				},
			]
		}
	}

	const url = buildOverpassUrl(featureType, id, full)
	try {
		const request = await fetch(url, overpassFetchOptions)
		if (!request.ok) {
			console.log('lightgreen request not ok', request)

			return [{ id, failedServerOsmRequest: true, type: featureType }]
		}
		const json = await request.json()

		const elements = json.elements

		if (featureType === 'node' && elements.length === 1) {
			try {
				const tags = elements[0].tags || {}
				// handle this use case https://wiki.openstreetmap.org/wiki/Relation:associatedStreet
				// example : https://www.openstreetmap.org/node/3663795073
				if (tags['addr:housenumber'] && !tags['addr:street']) {
					const relationRequest = await fetch(
						buildOverpassUrl(featureType, id, false, true),
						overpassFetchOptions
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
	} catch (e) {
		console.error(
			'Probably a network error fetching OSM feature via Overpass',
			e
		)
		return [{ id, failedServerOsmRequest: true, type: featureType }]
	}
}

export const disambiguateWayRelation = async (
	presumedFeatureType,
	id,
	referenceLatLng,
	noDisambiguation
) => {
	console.log(
		'lightgreen disambiguateWayRelation, noDisambiguation : ',
		noDisambiguation
	)
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
			const enrichedWay = enrichOsmFeatureWithPolygon(way, request1)

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
			const enrichedWay = enrichOsmFeatureWithPolygon(way, request1)

			return [enrichedWay, 'way']
		}
		return [request2.find((el) => el.type === 'relation'), 'relation']
	}

	if (!request1.length && request2.length)
		return [request2.find((el) => el.type === 'relation'), 'relation']
	if (!request2.length && request1.length) {
		const way = request1.find((el) => el.type === 'way')
		const enrichedWay = enrichOsmFeatureWithPolygon(way, request1)

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
				coordinates: [[...nodes, nodes[0]].map(({ lat, lon }) => [lon, lat])],
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

export const enrichOsmFeatureWithPolygon = (element, elements) => {
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
