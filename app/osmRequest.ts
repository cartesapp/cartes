import { centerOfMass } from '@turf/turf'
//import osmApiRequest from '@/components/osm/osmApiRequest'
import { omit } from '@/components/utils/utils'
import { resilientOverpassFetch } from './overpassFetcher'
import { encodePlace } from './utils'

/**
 * Build the Overpass query to get 1 element with its geometry using parameter `out geom`
 * Since there is no recursion, no other element is returned than the requested one
 * (except when relations=true, which returns all the relations that include the
 * requested element, and not the element itself)
 */
const buildOverpassElementQuery = (
	featureType: 'node' | 'way' | 'relation',
	id: string,
	meta = false,
	relations = false
) =>
	`[out:json];${featureType}(id:${id});
	${relations ? '<;' : ''}
	out ${meta ? 'meta' : 'body'} geom qt;`

/**
 * Build, fetch and process the result of an Overpass query for 1 OSM element by type+ID
 */
export const osmElementRequest = async (featureType, id) => {
	// stop if type is not correct
	if (!['node', 'way', 'relation'].includes(featureType))
		return console.error(
			"This OSM feature is neither a node, a relation or a way, we don't know how to handle it"
		)

	// We tried setting up a local OSM api based on osm2psql
	// that enables bypassing overpass, which is quite a slow
	// software... well at least the main and only online overpass API, .de
	// (it may be under heavy load)
	//
	// But these requests can fail for some features, hence the fallback call
	// hereafter
	//
	// However, setting the osm database is quite hard. Despite its better
	// performance, we're falling back to hosting our own overpass instance. It
	// also takes less memory on our server than the full osm2psql db.
	//
	// We're keeping this code for a future optimisation, but using overpass for
	// now.
	/*
	const directElement = await osmApiRequest(featureType, id)

	if (
		directElement &&
		directElement !== 404 &&
		directElement.requestState !== 'fail'
	) {
		return directElement
	}
	*/

	const query = buildOverpassElementQuery(featureType, id, false)

	try {
		const json = await resilientOverpassFetch(query)
		if (json.elements.length != 1)
			return console.error(
				'OVERPASS result does not have only 1 element',
				json.elements
			)
		const [element] = json.elements

		//return the extended Overpass element (with osmCode, geojson, center, ...)
		return extendOverpassElement(element)
	} catch (e) {
		console.error(
			'Probably a network error fetching OSM feature via Overpass',
			e
		)
		return [{ id, requestState: 'fail', featureType }]
	}
}

/**
 * Build a geoJSON from the type and geometry of an OSM element returned by Overpass
 * @param element an element from the Overpass result property 'elements' including its geometry
 * @returns a geoJSON of type Point, LineString, Polygon or FeatureCollection
 */
const buildGeojsonFromOverpassElement = (element) => {
	// test if type is correct
	if (!element) return console.error('OVERPASS Element is undefined')
	if (!element.type || !['node', 'way', 'relation'].includes(element.type))
		return console.error('OVERPASS Wrong OSM type while reading an element')

	// if relation, recursive call on members
	if (element.type == 'relation')
		// TODO maybe need to handle specific cases based on role ?
		// TODO need to check why FeatureCollections are not drawn on the map
		return {
			type: 'FeatureCollection',
			features: element.members.map((element) =>
				buildGeojsonFromOverpassElement(element)
			),
		}

	// if point or way, determine geometry and type
	var coordinates = []
	var type = null
	if (element.type == 'node') {
		// for nodes : use lat + lon
		type = 'Point'
		coordinates = [element.lon, element.lat]
	} else if (element.type == 'way') {
		// for ways: transform overpass geometry in an array or coordinates
		type = 'LineString'
		coordinates = element.geometry.map((c) => [c.lon, c.lat])
		// if first and last points are identical, it is most probably a polygon
		if (coordinates[0].toString() === coordinates.at(-1).toString()) {
			type = 'Polygon'
			coordinates = [coordinates]
		}
	}
	// then build and return feature geojson
	return {
		type: 'Feature',
		geometry: {
			type: type,
			coordinates: coordinates,
		},
		properties: {},
	}
}

/**
 * Build an extended Overpass Element by joining : osmCode, tags, geojson, center, ...
 * @param element an element from the Overpass result property 'elements' including its geometry
 * @returns a hash with all the properties which are interesting for us
 */
export const extendOverpassElement = (element) => {
	// stop if not element
	if (!element) return {}
	// TODO add other tests ?

	const tags = element.tags || {}

	// handle the case of a house in an associatedStreet relation
	// https://wiki.openstreetmap.org/wiki/Relation:associatedStreet
	// example : https://www.openstreetmap.org/node/3663795073
	// is this old comment still true? : TODO this is broken, test and repair it,
	// taking into account the new format of the state feature
	if (
		element.type === 'node' &&
		tags['addr:housenumber'] &&
		!tags['addr:street'] &&
		!tags['name']
	) {
		try {
			// fetch all the relations which include this node
			const relationQuery = buildOverpassElementQuery(
				element.type,
				element.id,
				false,
				true
			)
			const json = resilientOverpassFetch(relationQuery)

			// find the relation of type associatedStreet
			const relation = json.elements.find((element) => {
				const {
					tags: { type: osmType },
				} = element

				return osmType === 'associatedStreet'
			})

			//if street relation found
			if (relation) {
				//build new tags for name and addr:street using name from the associatedStreet relation
				const newTags = omit(['type'], {
					...relation.tags,
					'addr:street': relation.tags.name,
					name: `${tags['addr:housenumber']} ${relation.tags.name}`,
				})
				//extend the element with the additional tags
				element = {
					...element,
					tags: { ...element.tags, ...newTags },
				}
			}
		} catch (e) {
			console.error('Overpass error while fetching associatedStreet relation')
		}
	}

	// Handle the case of the role admin_centre in a type=boundary relation
	const adminCentre = null
	if (element.type == 'relation' && tags['type'] == 'boundary') {
		adminCentre = element.members?.find((el) => el.role === 'admin_centre')
	}

	// TODO handle the case of several way elements for the same street

	// calculate geojson and center
	const geojson = buildGeojsonFromOverpassElement(element)
	const center = adminCentre
		? buildGeojsonFromOverpassElement(adminCentre)
		: centerOfMass(geojson)

	// return extended element
	return {
		type: element.type,
		id: element.id,
		osmCode: encodePlace(element.type, element.id), //useless here, should be calculated when needed
		tags: element.tags || {},
		//bounds: element.bounds,
		geojson,
		center,
		elements: [], //should not be used anymore ?
		requestState: 'success', // TODO why this ?
	}
}
