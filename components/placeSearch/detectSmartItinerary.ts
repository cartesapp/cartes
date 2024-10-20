import { buildPhotonItem } from '../fetchPhoton'
import { debounce } from '../utils/utils'
import { photonServerUrl } from '@/app/serverUrls'

const regexp = /^de\s(.+)\s(?:à|a)(.+)$/i

function fetchPhotonRaw(v, localSearch, zoom) {
	return fetch(
		`${photonServerUrl}/api/?q=${encodeURIComponent(v)}&limit=30&lang=fr${
			localSearch ? `&lat=${localSearch[0]}&lon=${localSearch[1]}` : ''
		}${zoom ? `&zoom=${Math.round(zoom)}` : ''}`
	).then((res) => res.json())
}

//TODO doesn't work below, fix it

function detectSmartItinerary(input, localSearch, zoom, then) {
	if (!input) return
	const detected = input.match(regexp)
	if (!detected) return
	const [, from, to] = detected

	const promises = Promise.all(
		[from, to].map((pointInput) =>
			fetchPhotonRaw(pointInput, localSearch, zoom)
		)
	)

	promises.then((res) =>
		then(
			res.map((featureCollection) =>
				buildPhotonItem(featureCollection.features[0])
			)
		)
	)
}

const debouncedDetectSmartItinerary = debounce(1000, detectSmartItinerary)

export default debouncedDetectSmartItinerary
