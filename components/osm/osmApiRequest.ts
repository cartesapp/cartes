import { getFetchUrlBase } from '@/app/serverUrls'

export default async function osmApiRequest(featureType, id) {
	const request = await fetch(
		getFetchUrlBase() + `/api/osm/?featureType=${featureType}&osmId=${id}`
	)

	const json = await request.json()

	return json
}
