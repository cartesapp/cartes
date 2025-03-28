import { getFetchUrlBase } from '@/app/serverUrls'

export default async function osmApiRequest(featureType, id) {
	try {
		const request = await fetch(
			getFetchUrlBase() + `/api/osm/?featureType=${featureType}&osmId=${id}`
		)
		if (!request.ok) {
			console.log('lightgreen request not ok', request)

			return [{ id, failedServerOsmRequest: true, type: featureType }]
		}

		const json = await request.json()

		return json
	} catch (e) {
		console.error(
			'Probably a network error fetching OSM feature via Overpass',
			e
		)
		return [{ id, failedServerOsmRequest: true, type: featureType }]
	}
}
