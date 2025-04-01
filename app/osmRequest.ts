import { centerOfMass } from '@turf/turf'
import osmToGeojson from 'osmtogeojson'
import { isServer } from './serverUrls'
import osmApiRequest from '@/components/osm/osmApiRequest'
import {
	featureCollectionFromOsmNodes,
	lonLatToPoint,
} from '@/components/geoUtils'
import { encodePlace } from './utils'

export const overpassFetchOptions = isServer
	? {
			headers: {
				'User-Agent': 'Cartes.app',
			},
			next: { revalidate: 5 * 60 },
	  }
	: { cache: 'force-cache' }
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

export const osmRequest = async (featureType, id) => {
	// Overpass requests for ways and relations necessitate "full" request mode
	// to be able to rebuild its shape based on its node and ways elements
	const full = ['way', 'relation'].includes(featureType)
	const isNode = featureType === 'node'
	if (!isNode && !full)
		return console.error(
			"This OSM feature is neither a node, a relation or a way, we don't know how to handle it"
		)

	console.log(
		'lightgreen will make OSM request',
		featureType,
		id,
		'full : ',
		full
	)

	// We're setting up a local OSM api based on osm2psql
	// that enables bypassing overpass, which is quite a slow
	// software... well at least the main and only online overpass API, .de
	// (it may be under heavy load)
	//
	// But these requests can fail for some features, hence the fallback call
	// hereafter
	const directElement = await osmApiRequest(featureType, id)

	if (directElement && directElement !== 404 && !directElement.failedRequest) {
		return directElement
	}

	const url = buildOverpassUrl(featureType, id, full)

	try {
		const request = await fetch(url, overpassFetchOptions)
		if (!request.ok) {
			console.log('lightgreen request not ok', request)

			return [{ id, failedRequest: true, type: featureType }]
		}
		const json = await request.json()

		const elements = json.elements

		if (!elements.length) return

		if (featureType === 'node' && elements.length === 1) {
			try {
				const [element] = elements
				const tags = element.tags || {}
				// handle this use case https://wiki.openstreetmap.org/wiki/Relation:associatedStreet
				// example : https://www.openstreetmap.org/node/3663795073
				// TODO this is broken, test and repair it, taking into account the new
				// format of the state feature
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
				} else {
					const center = lonLatToPoint(element.lon, element.lat)
					return {
						osmCode: encodePlace(featureType, id),
						center,
						tags,
						geojson: center,
					}
				}
			} catch (e) {
				return elements
			}
		}

		const element = elements.find((el) => el.id == featureId)
		const adminCenter =
				element && element.members?.find((el) => el.role === 'admin_centre'),
			adminCenterNode =
				adminCenter && elements.find((el) => el.id == adminCenter.ref)

		//console.log('admincenter', relation, adminCenter, adminCenterNode)
		const center = adminCenterNode
			? lonLatToPoint(adminCenterNode.lon, adminCenterNode.lat)
			: centerOfMass(
					featureCollectionFromOsmNodes(
						elements.filter((el) => el.lat && el.lon)
					)
			  )

		const { tags } = element

		const geojson = enrichOsmFeatureWithPolygon(element, elements).polygon

		return {
			osmCode: encodePlace(featureType, id),
			center,
			tags,
			geojson,
			elements,
		}
	} catch (e) {
		console.error(
			'Probably a network error fetching OSM feature via Overpass',
			e
		)
		return [{ id, failedRequest: true, featureType }]
	}
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
