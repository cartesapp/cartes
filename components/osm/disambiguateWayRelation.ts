import { osmElementRequest } from '@/app/osmRequest'
import turfDistance from '@turf/distance'

export default async function disambiguateWayRelation(
	presumedFeatureType,
	id,
	referenceLatLng,
	noDisambiguation
) {
	console.log(
		'lightgreen disambiguateWayRelation, noDisambiguation : ',
		noDisambiguation
	)
	// if no disambigiation, get element by type+ID
	if (noDisambiguation) {
		const result = await osmElementRequest(presumedFeatureType, id)
		return [result, presumedFeatureType]
	}
	// if presumed node, idem
	if (presumedFeatureType === 'node') {
		const result = await osmElementRequest('node', id)
		return [result, 'node']
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
