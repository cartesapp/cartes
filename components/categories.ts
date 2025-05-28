import baseCategories from '@/app/categories.yaml'
import moreCategories from '@/app/moreCategories.yaml'
import { parameterize } from '@/components/utils/utils'

// Augment category model with a key, built by encoding the name for use in the url
baseCategories.forEach((cat) => {
	cat.key = parameterize(cat.name)
})
moreCategories.forEach((cat) => {
	cat.key = parameterize(cat.name)
})

// remove inactive categories (only "Miellerie" right now)
export const filteredMoreCategories = moreCategories.filter(
	(cat) => !cat.inactive
)

//merge base and more categories
export const categories = [...baseCategories, ...filteredMoreCategories]

/**
 * Vérifie si un tag OSM (clé, valeur) correspond à une catégorie selon sa requête Overpass
 * @param key - La clé du tag OSM (ex: "amenity", "shop", etc.)
 * @param value - La valeur du tag OSM (ex: "restaurant", "bakery", etc.)
 * @returns La première catégorie correspondante ou undefined si aucune ne correspond
 */
//TODO is this an IA recoding of findCategory() ? Is it better anyhow ?
export function findCategoryForTag(key: string, value: string) {
	// Fonction pour vérifier si une requête correspond au tag
	const matchesQuery = (query: string) => {
		// Cas simple: [key=value]
		if (query === `[${key}=${value}]`) return true

		// Cas avec ~: [key~"value1|value2"]
		const regexMatch = query.match(/\[([^=~]+)~"?([^"\]]+)"?\]/)
		if (regexMatch && regexMatch[1] === key) {
			const pattern = regexMatch[2]
			// Créer une regex à partir du pattern dans la requête
			try {
				const regex = new RegExp(pattern)
				return regex.test(value)
			} catch (e) {
				// Si le pattern n'est pas une regex valide, vérifier s'il contient la valeur
				return pattern.split('|').includes(value)
			}
		}

		return false
	}

	// Parcourir toutes les catégories
	for (const category of categories) {
		const queries = Array.isArray(category.query)
			? category.query
			: [category.query]

		// Si une des requêtes de la catégorie correspond au tag, retourner la catégorie
		if (queries.some(matchesQuery)) {
			return category
		}
	}

	return undefined
}

// use this to complete categoryGroupColors.yaml

/*
	console.log(
		'yocategories',
		[...new Set(categories.map((cat) => cat.group))].join('\n')
	)
	*/

/**
 * Get the list of categories matching URL parameters
 * @param searchParams list of parameters from the URL
 * @returns array of keys, and array of matching categories
 */
export const getCategories = (searchParams) => {
	// get property "cat" from the parameters
	const { cat } = searchParams
	// split cat string by separator to get the list of (potential) keys
	const categoryKeys = cat ? cat.split(categorySeparator) : [],
		// then search for categories matching the keys
		matchingCategories = categoryKeys
			.map((k) => categories.find((c) => c.key === k))
			.filter(Boolean)
	// get keys which are actually matching a category
	const matchingKeys = matchingCategories.map((c) => c.key)
	// return the list of true keys and the list of matching categories
	return [matchingKeys, matchingCategories]
}

export const categorySeparator = '|'
