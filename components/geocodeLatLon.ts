import { photonServerUrl } from '@/app/serverUrls'
import { buildPhotonAddress } from './osm/buildAddress'

export async function geocodeLatLon(latitude, longitude) {
	const request = await fetch(
		`${photonServerUrl}/reverse?lon=${longitude}&lat=${latitude}`,
		{
			cache: 'force-cache',
		}
	)
	const json = await request.json()

	const result = {
		latitude,
		longitude,
		data: json,
	}
	return result
}

export async function geocodeGetAddress(latitude, longitude, id) {
	const candidates = await geocodeLatLon(latitude, longitude)

	console.log(candidates)

	const features = candidates?.data?.features
	if (!features) return null

	const feature = features[0]
	/* A gecode request can return a different OSM entity than the one with the
	 * initial lat lon. E.g. ?allez=Maxi Zoo|n12469510970|-1.2841246|47.0990106#15/47.09901/-1.28412/15/40
	 *
	 * We assume here that photon sorts them by proximity, and make the
	 * approximation that the first represnts the good city and above
	 * administrative entities
	find(
		(feature) => console.log(feature) || feature.properties?.osm_id == id
	)
	*/

	console.log('FF', feature, id)
	const address = feature && buildPhotonAddress(feature)

	return [address, feature]
}