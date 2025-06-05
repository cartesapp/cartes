import categories from '@/app/categories.yaml'
import { extendOverpassElement } from '@/app/osmRequest'
import { resilientOverpassFetch } from '@/app/overpassFetcher'
import { filteredMoreCategories as moreCategories } from '@/components/categories'
import computeBboxArea from '@/components/utils/computeBboxArea'

/**
 * Build and fetch an Overpass query for a category on a bbox
 */
const surfaceDivider = 1000000
export async function fetchOverpassCategoryRequest(
	bbox,
	category,
	limitQuerySurface = true
) {
	// calculate the area of the bbox (in m²) and stop if it is above 1000 km²
	const surface = computeBboxArea(bbox)

	if (limitQuerySurface && surface / surfaceDivider > 1000) {
		return console.log(
			`Surface ${
				surface / surfaceDivider
			} is considered too big (> 1000km²) for overpass API`
		)
	}

	// build the array of queries (since a category may join several key:tag queries)
	const queries =
		typeof category.query === 'string' ? [category.query] : category.query

	// add osm types and bbox to each query and join them in a core query
	const queryCore = queries
		.map((query) => {
			return `nwr${query}(${bbox.join(',')});`
		})
		.join('')

	// build the complete query with output parameters
	const query = `[out:json];
		(${queryCore});
		out body geom qt;`

	// fetch the Overpass request
	//console.log('OVERPASS query:', query)
	const json = await resilientOverpassFetch(query)

	// build and return the result by joining :
	//  - the extended Overpass element : osmCode, tags, geojson, center, ...
	//  - with the category name
	const result = json.elements.map((element) => {
		const extendedElement = extendOverpassElement(element)
		//console.log('OVERPASS RESULT element NEW:',extendedElement)
		return {
			...extendedElement,
			categoryKey: category.key,
		}
	})
	return result
}

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
/**
 * Compare tags with category query(or queries) to calculate a match score
 * @param tags
 * @returns the category with the best score (or undefined if no match)
 */
export const findCategory = (tags) => {
	// map all categories to calculate their match scores
	var categories = allCategories.map((c) => {
		// puts query in an array
		const queries = Array.isArray(c.query) ? c.query : [c.query]
		// calculate the score of each query line ...
		const lineScore = queries.map((queryLine) => {
			// ... by finding the number of k/v pairs that match the queryLine ...
			const matchTags = Object.entries(tags).filter(
				([k, v]) => queryLine.includes(k) && queryLine.includes(v)
			)
			// ... and counting them
			return matchTags.length
		})
		// then the score of a query is the max of its queryLine scores
		return { ...c, score: Math.max(...lineScore) }
	})

	// calculate max score of all categories
	const maxScore = Math.max.apply(
		Math,
		categories.map((c) => c.score)
	)
	// exit if no match
	if (maxScore == 0) return

	// filter categories on max score
	categories = categories.filter((c) => c.score == maxScore)

	// if only 1 match, return it
	if (categories.length == 1) return categories[0]

	// else (same max score for several categories)

	// handle specific cases
	// Parking : car VS bicycle
	if (tags.amenity == 'parking')
		return categories.filter((c) => c.key == 'parking-voiture')[0]
	if (tags.amenity == 'bicycle_parking')
		return categories.filter((c) => c.key == 'parking-velo')[0]
	// TODO handle other specific cases

	// case not handled yet : log it
	console.log(
		'findCategory from tags : multiple matchs with same score',
		categories,
		tags
	)
	// and choose 1 by chance (ahaha)
	return categories[Math.floor(Math.random() * categories.length)]
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
	const similarNodes = await fetchOverpassCategoryRequest(bbox, category)

	return similarNodes
}
