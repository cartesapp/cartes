import { geocodeGetAddress } from '@/components/geocodeLatLon'
import { osmElementRequest } from './osmRequest'
import { isServer } from './serverUrls'
import { decodePlace } from './utils'
import { lonLatToPoint } from '@/components/geoUtils'

export const stepOsmRequest = async (point, state = [], geocode = false) => {
	if (!point || point === '') return null
	// those constitute the encoding of a place in the "allez" url query param
	const [name, osmCode, longitude, latitude] = point.split('|')

	const found = state
		.filter(Boolean)
		.find(
			(point) =>
				osmCode !== '' &&
				point.osmCode === osmCode &&
				!point.requestState === 'fail'
		)
	if (found) return found // already cached, don't make useless requests

	const center = lonLatToPoint(longitude, latitude)

	if (osmCode === '') {
		return {
			center,
			allezValue: point,
			name,
		}
	}

	const [featureType, featureId] = decodePlace(osmCode)

	const element = await osmElementRequest(featureType, featureId)

	// Failed, but we can still use the data encoded in the URL
	if (element.failedRequest) {
		return {
			...element,
			center,
			allezValue: point,
			name,
		}
	}

	const result = {
		center,
		...element,
		osmCode,
		name,
		allezValue: point,
	}

	if (!geocode) return result

	const coordinates = element.center?.geometry.coordinates

	const [photonAddress, photonFeature] = await geocodeGetAddress(
		latitude || coordinates[1],
		longitude || coordinates[0]
	)
	return { ...result, photonAddress, photonFeature }
}
