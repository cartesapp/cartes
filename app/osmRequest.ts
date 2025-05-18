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

	// build the query
	const query = buildOverpassElementQuery(featureType, id, false)

	try {
		// fetch the query
		const json = await resilientOverpassFetch(query)
		// check if element is found
		if (json.elements.length != 1) {
			console.error('OVERPASS OSM element not found', `${featureType}/${id}`)
			return null
		}
		var [element] = json.elements
		const tags = element.tags || {}

		// In this function used to fetch only 1 element, we authorize a few more queries to add
		// intel coming from related elements (mostly relation of which the element is a member)

		// 1. handle the case of a house in an associatedStreet relation, to get street name
		// https://wiki.openstreetmap.org/wiki/Relation:associatedStreet
		// example : https://www.openstreetmap.org/node/3663795073
		if (
			element.type === 'node' &&
			tags['addr:housenumber'] &&
			!tags['addr:street']
		) {
			// fetch the associatedStreet relation which include this node
			const relation = await fetchAssociatedStreet(element)
			//if associatedStreet relation found
			if (relation) {
				//merge tags of street and house
				const newTags = omit(['type'], {
					...relation.tags,
					'addr:street': relation.tags.name,
					name: `${tags['addr:housenumber']} ${relation.tags.name}`,
					...element.tags, //will overwrite previous one if same key
				})
				//update the element with the additional tags
				element = {
					...element,
					tags: newTags,
				}
			}
		}

		// 2. handle the case of several way elements for the same street
		if (
			element.type === 'way' &&
			[
				'pedestrian',
				'living_street',
				'residential',
				'tertiary',
				'secondary',
				'primary',
			].includes(tags['highway'])
			// TODO do we need to add other highway values ?
		) {
			// fetch all the ways of the street as an associatedStreet-like relation
			element = await fetchStreet(element)
		}

		//return the extended Overpass element (with osmCode, geojson, center, ...)
		return extendOverpassElement(element)
	} catch (e) {
		// if overpass request failed, return element with 'fail' state
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
	if (
		!element.type ||
		!['node', 'way', 'multiway', 'relation'].includes(element.type)
	)
		return console.error('OVERPASS Wrong OSM type while reading an element')

	// if relation, recursive call on members
	if (['multiway', 'relation'].includes(element.type))
		// TODO maybe need to handle specific cases based on role ?
		// for example inner and outer in a multipolygon
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

	// Handle the case of the role admin_centre in a type=boundary relation
	const adminCentre = null
	if (element.type == 'relation' && tags['type'] == 'boundary') {
		adminCentre = element.members?.find((el) => el.role === 'admin_centre')
	}

	// calculate geojson and center
	const geojson = buildGeojsonFromOverpassElement(element)
	const center = adminCentre
		? buildGeojsonFromOverpassElement(adminCentre)
		: centerOfMass(geojson)
	// TODO : for rounded ways, centerOfMass is not on the line, this is unexpected for the user,
	// we should move the center of mass to the closest node of the way.

	// return extended element
	if (element.type == 'multiway') element.type = 'way' //set type back to multiway
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

/**
 * Build and fetch an Overpass query to get the associatedStreet relation which include this element
 * @param element the requested OSM element
 * @returns the associatedStreet relation (or undefined if not found or if error)
 */
const fetchAssociatedStreet = async (element) => {
	try {
		// fetch all the relations which include this element
		const relationQuery = buildOverpassElementQuery(
			element.type,
			element.id,
			false,
			true // to get relations
		)
		const json = await resilientOverpassFetch(relationQuery)
		console.log('Etienne fetchAssociatedStreet', json)
		// find the relation of type associatedStreet and return it
		const relation = json.elements.find((element) => {
			const {
				tags: { type: osmType },
			} = element

			return osmType === 'associatedStreet'
		})
		return relation
	} catch (e) {
		// if error, log and return null
		console.log('Overpass error while fetching associatedStreet relation', e)
		return undefined
	}
}

/**
 * Get all ways by associatedStreet relation AND by way name from a starting way
 * @param element
 * @returns an associatedStreet-like relation
 */
const fetchStreet = async (element) => {
	if (!element.type) return
	if (element.type != 'way') return
	try {
		/*
		Build the Overpass query to get all the ways in the same street than the
		requested element, using its name as filter (case insensitive)
		and the `complete` statement to make recursive searchs
		in a 30m radius around the previous output set, until it stabilizes
		(to get all ways even if there is a gap, for example a roundabout )
		 */
		const query =
			`[out:json]; ${element.type}(id:${element.id});` + //get starting element
			'<; relation._[type=associatedStreet]; out tags;' + // get and output the street relation
			'>; way._ -> .w;' + //get and store the ways members of the relation
			`${element.type}(id:${element.id});` + //get starting element again (input set seems broken on complete ?)
			`complete { way[highway]["name"~"${element.tags.name}",i](around:30); };` + // get all highways by name
			'(._; .w;);' + //merge all found ways
			'out body geom qt;' //output all ways

		// fetch all the ways of the street
		const json = await resilientOverpassFetch(query)

		// if available (as 1st element), read relation tags and update way tags
		if (json.elements[0].type == 'relation') {
			const relationTags = json.elements[0].tags
			element.tags = omit(['type'], {
				...relationTags,
				...element.tags, //will overwrite previous ones if same key
			})
			json.elements.shift() //remove relation from the array
		}
		// TODO merge all tags from all ways ??

		//if only 1 element, it is the way itself, return it
		if (json.elements.length == 1) return element

		// Build and return an asssociatedStreet-like relation
		// warning : set type=multiway is the only way I found here to :
		//  - tell buildGeojsonFromOverpassElement that it is a FeatureCollection
		//  - without setting type=relation, to be able to put it back to type=way (after geojson calculation)
		//  - so that URL works
		// the other solution could be to test whether geometry is an array or coordinates (when 1 way)
		// or an array of arrays of coordinates (when multiple ways)
		return {
			type: 'multiway', //warning, need to be set back to 'way' after geojson calculation
			id: element.id,
			tags: element.tags,
			//bounds: ??; //unable to recalculate it
			members: json.elements.map((e) => {
				return {
					type: 'way',
					ref: e.id,
					role: 'street',
					geometry: e.geometry,
				}
			}),
		}
	} catch (e) {
		// if error, log and return null
		console.log('Overpass error while fetching all street ways', e)
		return undefined
	}
}
