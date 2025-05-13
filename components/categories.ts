import baseCategories from '@/app/categories.yaml'
import moreCategories from '@/app/moreCategories.yaml'

export const filteredMoreCategories = moreCategories.filter(
	(cat) => !cat.inactive
)

export const categories = [...baseCategories, ...filteredMoreCategories]

//console.log(categories.map((category) => category.query))

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

export const getCategories = (searchParams) => {
	const { cat } = searchParams
	const categoryNames = cat ? cat.split(categorySeparator) : [],
		categoriesObjects = categoryNames.map((c) =>
			categories.find((c2) => c2.name === c)
		)

	return [categoryNames, categoriesObjects]
}

export const categorySeparator = '|'
