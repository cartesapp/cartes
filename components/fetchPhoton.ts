import { buildAllezPart } from '@/app/SetDestination'
import { encodePlace } from '@/app/utils'
import {
	debounce,
	getArrayIndex,
	omit,
	replaceArrayIndex,
} from '@/components/utils/utils'
import { photonServerUrl } from '@/app/serverUrls'

//const photonBaseUrl = 'https://photon.komoot.io'
const photonBaseUrl = photonServerUrl

function fetchPhoton(v, setState, stepIndex, local, zoom, setSearchParams) {
	/*
	 * Google had introduced a search mode where the first result was automatically validated. Duckduckgo took it over with the “!” syntax at the end of the search phrase. Kagi followed with https://github.com/kagisearch/bangs.

I'd like to reintroduce it here, just the original I feel lucky bang. But it's not easy, because of the contextual search. When you search for “Rennes” from Brest, the first result is legitimately, in local mode by default, rue de Rennes!

So perhaps this “bang” would force the search to the scale of France, rather than the local scale of the moment.

	 * */
	const hasBang = v.endsWith(' !')

	const limit = hasBang ? 1 : 10
	const localPart = hasBang
		? `&lat=${46.85}&lon=${2.02}`
		: local
		? `&lat=${local[0]}&lon=${local[1]}`
		: ''

	const zoomPart = hasBang ? `&zoom=5` : zoom ? `&zoom=${Math.round(zoom)}` : ''
	return fetch(
		`${photonBaseUrl}/api/?q=${encodeURIComponent(
			v
		)}&limit=${limit}&lang=fr${localPart}${zoomPart}`
	)
		.then((res) => res.json())
		.then((json) => {
			if (hasBang) {
				const item = buildPhotonItem(json.features[0])

				return setSearchParams({
					allez: buildAllezPart(
						item.name,
						encodePlace(item.featureType, item.osmId),
						item.latitude,
						item.longitude
					),
				})
			}
			setState((state) => {
				if (v !== getArrayIndex(state, stepIndex)?.inputValue) return state
				else
					return replaceArrayIndex(
						state,
						stepIndex,
						{
							results: json.features.map((f) => buildPhotonItem(f)),
						},
						'merge'
					)
			})
		})
}

export const buildPhotonItem = (f) => ({
	...omit(['osm_id', 'osm_type'], f.properties),
	osmId: f.properties.osm_id,
	featureType:
		f.properties.osm_type &&
		{ R: 'relation', N: 'node', W: 'way' }[f.properties.osm_type],
	longitude: f.geometry.coordinates[0],
	latitude: f.geometry.coordinates[1],
	//région fr : f.properties.state,
	//département fr: f.properties.county,
})

const debounced = debounce(500, fetchPhoton)

export const extractOsmFeature = (choice) => {
	if (!choice) return [null, null]

	return [choice.featureType, choice.osmId]
}

export default debounced
