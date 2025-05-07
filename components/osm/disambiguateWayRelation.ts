import { osmElementRequest } from '@/app/osmRequest'
import turfDistance from '@turf/distance'
import buildOsmFeatureGeojson from './buildOsmFeatureGeojson'

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
	if (noDisambiguation) {
		const result = await osmElementRequest(presumedFeatureType, id)
		return [result, presumedFeatureType]
	}
	if (presumedFeatureType === 'node') {
		const result = await osmElementRequest('node', id)
		return [result, 'node']
	}

	const request1 = await osmElementRequest('way', id)
	const request2 = await osmElementRequest('relation', id)
	if (request1.elements.length && request2.elements.length) {
		// This is naïve, we take the first node, considering that the chances that the first node of the relation and way with same reconstructed id are close to our current location is extremely low
		const node1 = request1.find((el) => el.type === 'node')
		const node2 = request2.find((el) => el.type === 'node')
		if (!node1)
			return [request2.find((el) => el.type === 'relation'), 'relation']
		if (!node2) {
			const way = request1.find((el) => el.type === 'way')
			const geojson = buildOsmFeatureGeojson(way, request1)

			return [{ ...way, geojson }, 'way']
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
			const geojson = buildOsmFeatureGeojson(way, request1)

			return [{ ...way, geojson }, 'way']
		}
		return [request2.find((el) => el.type === 'relation'), 'relation']
	}

	if (!request1.elements.length && request2.elements.length)
		return [request2.find((el) => el.type === 'relation'), 'relation']
	if (!request2.elements.length && request1.elements.length) {
		const way = request1.find((el) => el.type === 'way')
		const geojson = buildOsmFeatureGeojson(way, request1)

		return [{ ...way, geojson }, 'way']
	}

	return [null, null]
}
