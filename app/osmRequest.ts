import { centerOfMass } from '@turf/turf'
import { isServer } from './serverUrls'
import osmApiRequest from '@/components/osm/osmApiRequest'
import {
	featureCollectionFromOsmNodes,
	lonLatToPoint,
} from '@/components/geoUtils'
import { encodePlace } from './utils'
import buildOsmFeatureGeojson from '@/components/osm/buildOsmFeatureGeojson'
import { resilientOverpassFetch } from './overpassFetcher'

export const overpassFetchOptions = isServer
	? {
			headers: {
				'User-Agent': 'Cartes.app',
			},
			next: { revalidate: 5 * 60 },
	  }
	: { cache: 'force-cache' }

export const overpassRequestSuffixs = [
	'https://overpass.cartes.app/api/interpreter?data=',
	'https://overpass-api.de/api/interpreter?data=',
]

const buildOverpassQuery = (
	featureType: 'node' | 'way' | 'relation',
	id: string,
	full = false,
	relations = false,
	meta = false
) =>
	encodeURIComponent(
		`[out:json];${featureType}(id:${id});${
			full ? '(._;>;);' : relations ? '<;' : ''
		}out body${meta ? ` meta` : ''};`
	)

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

	const query = buildOverpassQuery(featureType, id, full)

	try {
		const json = await resilientOverpassFetch(query)

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
					const relationQuery = buildOverpassQuery(featureType, id, false, true)
					const json = await resilientOverpassFetch(relationQuery)
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
