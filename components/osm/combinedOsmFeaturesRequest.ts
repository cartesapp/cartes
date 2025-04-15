import {
	buildStepFromOverpassNode,
	buildStepFromOverpassWayOrRelation,
} from '@/app/osmRequest'
import { resilientOverpassFetch } from '@/app/overpassFetcher'

export default async function combinedOsmFeaturesRequest(queries) {
	const requestBody = queries
		.map((result) => {
			const { osmId, featureType, latitude, longitude } = result

			return `${featureType}(id:${osmId}); out body; `
		})
		.join('')

	const requestString = `[out:json];${requestBody}`
	const query = encodeURIComponent(requestString)

	const options = {
		next: { revalidate: 5 * 60 },
	}
	const json = await resilientOverpassFetch(query, options)

	const { elements } = json

	console.log('indigo combined', elements)

	const results = queries
		.map((query) => {
			const found = elements.find(
				(element) =>
					query.osmId === element.id && query.featureType === element.type
			)

			if (!found) return false
			const feature =
				query.featureType === 'node'
					? buildStepFromOverpassNode(found, query.featureType, query.osmId)
					: buildStepFromOverpassWayOrRelation(
							found,
							elements,
							query.osmId,
							query.featureType
					  )

			console.log('indigo combined', feature)
			return feature
		})
		.filter(Boolean)
	console.log('requestString', requestString, results)

	//TODO we don't handle housenumbers like in osmRequest, not sure we need this
	//in this combinedOsmRequest function that is used to enrich photon search
	//results with OSM tags
	return results
}
