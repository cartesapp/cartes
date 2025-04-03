import categories from '@/app/categories.yaml'
import {
	buildStepFromOverpassNode,
	buildStepFromOverpassWayOrRelation,
	overpassFetchOptions,
	overpassRequestSuffix,
} from '@/app/osmRequest'
import { filteredMoreCategories as moreCategories } from '@/components/categories'
import computeBboxArea from '@/components/utils/computeBboxArea'

export async function fetchOverpassRequest(bbox, category) {
	const surface = computeBboxArea(bbox)

	if (surface / 1000000 > 1000) {
		return console.log('Surface considered too big for overpass API')
	}

	const queries =
		typeof category.query === 'string' ? [category.query] : category.query

	const queryCore = queries
		.map((query) => {
			return `nwr${query}(${bbox.join(',')});`
		})
		.join('')
	// TODO we're missing the "r" in "nwr" for "relations"
	const overpassRequest = buildOverpassRequest(queryCore)

	const url = `${overpassRequestSuffix}${encodeURIComponent(overpassRequest)}`
	console.log('OVERPASS2', url)
	const request = await fetch(url, overpassFetchOptions)
	const json = await request.json()

	const nodeElements = convertOverpassCategoryResultsToSteps(
		json,
		category.name
	)
	return nodeElements
}

// I suspect this should be handled by a code we already have, with just a loop
// more
const convertOverpassCategoryResultsToSteps = (json, categoryName) => {
	const relations = json.elements.filter(
		(element) => element.type === 'relation'
	)
	console.log('Relations in similar nodes are not handled yet :', relations)

	console.log('indigo debug similar nodes', json.elements)

	const nodesOrWays = json.elements.filter((element) =>
		['way', 'node'].includes(element.type)
	) // see TODO above about relations

	const waysNodes = nodesOrWays
		.filter((el) => el.type === 'way')
		.map((el) => el.nodes)
		.flat()

	// Reject elements (nodes I guess ?) that are constituents of ways
	const interestingElements = nodesOrWays.filter(
		(el) => !waysNodes.find((id) => id === el.id)
	)

	const nodeElements = interestingElements.map((element) => {
		if (element.type === 'node') return buildStepFromOverpassNode(element)
		return buildStepFromOverpassWayOrRelation(element, json.elements)
	})
	return nodeElements.map((element) => ({
		...element,
		categoryName,
	}))
}

export const buildOverpassRequest = (queryCore) => `
[out:json];
(
${queryCore}
);

out body;
>;
out skel qt;

`

// This is very scientific haha
const latDifferenceOfRennes = 0.07,
	lonDifferenceOfRennes = 0.15,
	latDiff = latDifferenceOfRennes / 2,
	lonDiff = lonDifferenceOfRennes / 2
// 48.07729814876498,-1.7461581764997334,48.148123804291316,-1.5894174840209132
/* compute km2 to check
	const earthRadius = 6371008.8
	const [south, west, north, east] = bbox

	const surface =
		(earthRadius *
			earthRadius *
			Math.PI *
			Math.abs(Math.sin(rad(south)) - Math.sin(rad(north))) *
			(east - west)) /
		180

	// rad is:
	function rad(num) {
		return (num * Math.PI) / 180
	}
	*/
export const computeBbox = ({ lat, lon }) => [
	lat - latDiff / 2,
	lon - lonDiff / 2,
	lat + latDiff / 2,
	lon + lonDiff / 2,
]
export const findCategory = (tags) => {
	const category = allCategories.find(({ query: queryRaw }) => {
		const query = Array.isArray(queryRaw) ? queryRaw : [queryRaw]

		const test = query.some((queryLine) => {
			const andConditions = extractOverpassQueryLineAndCondition(queryLine)
			return andConditions.every((condition) => {
				return Object.entries(tags).find(
					([k, v]) => condition.includes(k) && condition.includes(v)
				)
			})
		})
		return test
	})

	return category
}

const pattern = /\[([^\]]+)\]/g
const extractOverpassQueryLineAndCondition = (queryLine) => {
	let match
	const patterns = []

	while ((match = pattern.exec(queryLine)) !== null) {
		patterns.push(match[1])
	}
	if (!patterns.length)
		throw new Error('Any overpass query should have a [] pattern')
	return patterns
}

const allCategories = [...categories, ...moreCategories]

export const fetchSimilarNodes = async (osmFeature) => {
	const tags = osmFeature && osmFeature.tags
	const category = tags && findCategory(tags)

	if (!category) return null

	const [lon, lat] = osmFeature.center.geometry.coordinates
	const bbox = computeBbox({ lat, lon })
	const similarNodes = await fetchOverpassRequest(bbox, category)

	return similarNodes
}
