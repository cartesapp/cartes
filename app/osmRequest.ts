import { centerOfMass } from '@turf/turf'
import { isServer } from './serverUrls'
import osmApiRequest from '@/components/osm/osmApiRequest'
import {
	featureCollectionFromOsmNodes,
	lonLatToPoint,
} from '@/components/geoUtils'
import { encodePlace } from './utils'
import buildOsmFeatureGeojson from '@/components/osm/buildOsmFeatureGeojson'

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

	if (
		directElement &&
		directElement !== 404 &&
		directElement.requestState !== 'fail'
	) {
		return directElement
	}

	const url = buildOverpassUrl(featureType, id, full)

	try {
		const request = await fetch(url, overpassFetchOptions)
		if (!request.ok) {
			console.log('lightgreen request not ok', request)

			return [{ id, requestState: 'fail', type: featureType }]
		}
		const json = await request.json()

		const elements = json.elements

		if (!elements.length) return // TODO return what ?

		if (featureType === 'node' && elements.length === 1) {
			try {
				const [element] = elements
				const tags = element.tags || {}
				// handle this use case https://wiki.openstreetmap.org/wiki/Relation:associatedStreet
				// example : https://www.openstreetmap.org/node/3663795073
				// TODO this is broken, test and repair it, taking into account the new
				// format of the state feature
				const center = lonLatToPoint(element.lon, element.lat)
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
					const [element] = elements
					return buildStepFromOverpassNode(element, featureType, id)
				}
			} catch (e) {
				//TODO this is a copy of above, shouldn't happen when TODO above will be
				//rewritten to handle housenumbers
				const [element] = elements
				return buildStepFromOverpassNode(element, featureType, id)
			}
		}
		const element = elements.find((el) => el.id == id)

		return buildStepFromOverpassWayOrRelation(
			element,
			elements,
			id,
			featureType
		)
	} catch (e) {
		console.error(
			'Probably a network error fetching OSM feature via Overpass',
			e
		)
		return [{ id, requestState: 'fail', featureType }]
	}
}
export const buildStepFromOverpassWayOrRelation = (
	element,
	elements,
	id = null,
	featureType = null
) => {
	const adminCenter =
			element && element.members?.find((el) => el.role === 'admin_centre'),
		adminCenterNode =
			adminCenter && elements.find((el) => el.id == adminCenter.ref)

	//console.log('admincenter', relation, adminCenter, adminCenterNode)
	const center = adminCenterNode
		? lonLatToPoint(adminCenterNode.lon, adminCenterNode.lat)
		: centerOfMass(
				featureCollectionFromOsmNodes(elements.filter((el) => el.lat && el.lon))
		  )
	// TODO center could also be derived from this geojson ?
	const geojson = buildOsmFeatureGeojson(element, elements)

	const { tags } = element

	return {
		osmCode: encodePlace(featureType || element.type, id),
		center,
		tags,
		geojson,
		elements,
		requestState: 'success',
	}
}

export const buildStepFromOverpassNode = (
	element,
	featureType = null,
	id = null
) => {
	const tags = element.tags || {}
	const center = lonLatToPoint(element.lon, element.lat)
	return {
		osmCode: encodePlace(featureType || element.type, id || element.id),
		center,
		tags,
		geojson: center,
		requestState: 'success',
	}
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
