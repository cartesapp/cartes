import {
	extendOverpassElement,
} from '@/app/osmRequest'
import { resilientOverpassFetch } from '@/app/overpassFetcher'

/**
 * Fetch an Overpass request to get the data about a list of OSM elements (resulting from a photon search for example)
 * @param queries the list of type+id for the wanted OSM elements
 * @returns an array of augmented elements : osmCode, tags, geojson, center, ...
 */
export default async function combinedOsmFeaturesRequest(queries) {
	// build the request body by joining type and id of the requested elements
	const requestBody = queries
		.map((result) => {
			const { osmId, featureType, latitude, longitude } = result
			return `${featureType}(id:${osmId});`
		})
		.join('')

	// build the complete query by adding output paramaters
	const query = `[out:json];(${requestBody});out body geom qt;`

	// fetch the Overpass request
	const options = {
		next: { revalidate: 5 * 60 },
	}
	const json = await resilientOverpassFetch(query, options)

	// return list of extended Overpass elements (osmCode, tags, geojson, center, ...)
	return json.elements.map((element) => extendOverpassElement(element) )
}
