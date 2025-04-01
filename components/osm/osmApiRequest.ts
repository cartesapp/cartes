import { getFetchUrlBase } from '@/app/serverUrls'
import { encodePlace } from '@/app/utils'
import { centerOfMass } from '@turf/turf'

export default async function osmApiRequest(featureType, id) {
	try {
		const request = await fetch(
			getFetchUrlBase() + `/api/osm?featureType=${featureType}&osmId=${id}`
		)

		if (request.status === 404) {
			return 404
		}

		if (!request.ok) {
			console.log('lightgreen request not ok', request)

			return [{ id, failedRequest: true, featureType }]
		}

		const json = await request.json()

		if (json.type === 'FeatureCollection') {
			console.error('FeatureCollections from /api/osm are not handled yet')
		}
		const {
			properties: { tags },
			geometry: { type, coordinates },
		} = json

		const osmCode = encodePlace(featureType, id)

		if (type === 'Point') {
			console.log('lightgreen success with OSM API')
			return [
				{
					osmCode,
					featureType,
					id,
					center: json,
					geojson: json,
					tags,
				},
			]
		}

		if (type === 'Polygon') {
			const center = centerOfMass(json)
			return [
				{
					osmCode,
					featureType,
					id,
					center,
					tags,
					geojson: json,
				},
			]
		} else {
			console.log(
				'lightgreen got an element with OSM API but no geometry',
				json
			)

			return null
		}
	} catch (e) {
		console.error(
			'Probably a network error fetching OSM feature via Overpass',
			e
		)
		return [{ id, failedRequest: true, featureType }]
	}
}
