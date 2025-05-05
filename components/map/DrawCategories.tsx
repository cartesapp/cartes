import useDrawFeatures from '@/app/effects/useDrawFeatures'
import categoryGroupColors from '@/app/categoryGroupColors.yaml'

export default function ({
	categories,
	quickSearchFeaturesMap,
	onSearchResultClick,
	safeStyleKey,
	map,
}) {
	const entries = Object.entries(quickSearchFeaturesMap)
	return entries.map(([categoryName, features]) => {
		const category = categories.find((cat) => cat.name === categoryName)
		if (!category) return
		return (
			<DrawCategory
				key={category.name}
				{...{
					category,
					features,
					map,
					onSearchResultClick,
					safeStyleKey,
				}}
			/>
		)
	})
}

const showOpenOnly = false
function DrawCategory({
	category,
	onSearchResultClick,
	map,
	safeStyleKey,
	features,
}) {
	console.log('indigo enquête', features)
	useDrawFeatures(
		map,
		features,
		showOpenOnly,
		category,
		onSearchResultClick,
		categoryGroupColors[category.group],
		false,
		safeStyleKey
	)
	return null
}
