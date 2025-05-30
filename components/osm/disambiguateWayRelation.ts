import { osmElementRequest } from '@/app/osmRequest'
import turfDistance from '@turf/distance'
/**
 * Check whether an OSM ID is a way or a relation
 * (in case we don't have the intel,e.g. after a click on a tile element)
 * @param presumedFeatureType presumed OSM type
 * @param id OSM ID
 * @param referenceLatLng LatLng of the clicked point
 * @param noDisambiguation set to true to search by type+ID
 * @returns the array [OverpassElement, OSM type]
 */
export default async function disambiguateWayRelation(
	presumedFeatureType,
	id,
	referenceLatLng,
	noDisambiguation
) {
	// if no disambigiation, or presumed node, get element by type+ID
	if (noDisambiguation || presumedFeatureType === 'node') {
		const result = await osmElementRequest(presumedFeatureType, id)
		return [result, presumedFeatureType]
	}

	// fetch both way and relation by ID
	const wayResult = await osmElementRequest('way', id)
	const relResult = await osmElementRequest('relation', id)

	// if both exist
	if (wayResult && relResult) {
		// calculate both distances to the reference latlng
		const reference = [referenceLatLng.lng, referenceLatLng.lat]
		const wayDistance = turfDistance(wayResult.center, reference)
		const relDistance = turfDistance(wayResult.center, reference)
		// return the closest
		if (wayDistance < relDistance) return [wayResult, 'way']
		else return [relResult, 'relation']
	}
	// if only one exists, return it
	if (wayResult) return [wayResult, 'way']
	if (relResult) return [relResult, 'relation']

	//else return nothing
	return [null, null]
}
