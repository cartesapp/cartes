import { getFetchUrlBase } from '../serverUrls'

const urlBase = `https://cdn.jsdelivr.net/gh/osmandapp/OsmAnd-resources/icons/svg/`

export default async function getIcons(tags) {
	const results = await Promise.all(
		Object.entries(tags).map(async ([k, v]) => {
			const request = await fetch(
				getFetchUrlBase() + `/api/osmTagsToIcon?k=${k}&v=${v}`
			)
			const json = await request.json()
			return json
		})
	)

	return results.filter(Boolean).map((el) => urlBase + el[1])
}
