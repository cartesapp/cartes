import { geocodeGetAddress } from '@/components/geocodeLatLon'
import { centerOfMass } from '@turf/turf'
import { enrichOsmFeatureWithPolygon, osmRequest } from './osmRequest'
import { isServer } from './serverUrls'
import { decodePlace } from './utils'
import { lonLatToPoint } from '@/components/geoUtils'

export const stepOsmRequest = async (point, state = [], geocode = false) => {
	if (!point || point === '') return null
	// those constitute the encoding of a place in the "allez" url query param
	const [name, osmCode, longitude, latitude] = point.split('|')

	console.log('lightgreen will enrichState', { isServer }, state)
	const found = state
		.filter(Boolean)
		.find(
			(point) =>
				osmCode !== '' &&
				point.osmCode === osmCode &&
				!point.osmFeature?.failedServerOsmRequest
		)
	if (found) return found // already cached, don't make useless requests

	const [featureType, featureId] = decodePlace(osmCode)

	const element = await osmRequest(featureType, featureId)

	// Failed, but we can still use the data encoded in the URL
	if (element.failedRequest) {
		return {
			...element,
			longitude,
			latitude,
			allezValue: point,
			name,
		}
	}

	const result = {
		...element,
		osmCode,
		name,
		longitude: longitude || element.center.geometry.coordinates[0],
		latitude: latitude || element.center.geometry.coordinates[1],
		allezValue: point,
	}

	if (!geocode) return result
	//TODO what is this ? Who needs its ?
	return
	if (!osmFeature) return result

	const [photonAddress, photonFeature] = await geocodeGetAddress(
		result.latitude,
		result.longitude,
		osmFeature.id
	)
	return { ...result, photonAddress, photonFeature }
}
