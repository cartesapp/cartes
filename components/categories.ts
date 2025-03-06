import baseCategories from '@/app/categories.yaml'
import moreCategories from '@/app/moreCategories.yaml'

export const filteredMoreCategories = moreCategories.filter(
	(cat) => !cat.inactive
)

export const categories = [...baseCategories, ...filteredMoreCategories]

console.log(categories.map((category) => category.query))

// use this to complete categoryColors.yaml

false &&
	console.log(
		'yocategories',
		[...new Set(categories.map((cat) => cat.category))].join('\n')
	)

export const getCategories = (searchParams) => {
	const { cat } = searchParams
	const categoryNames = cat ? cat.split(categorySeparator) : [],
		categoriesObjects = categoryNames.map((c) =>
			categories.find((c2) => c2.name === c)
		)

	return [categoryNames, categoriesObjects]
}

export const categorySeparator = '|'
