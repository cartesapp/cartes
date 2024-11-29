 import useDrawQuickSearchFeatures from '@/app/effects/useDrawQuickSearchFeatures'
 import categoryColors from '@/app/categoryColors.yaml'
 
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
 	useDrawQuickSearchFeatures(
 		map,
 		features,
 		showOpenOnly,
 		category,
 		onSearchResultClick,
 		categoryColors[category.category],
 		false,
 		safeStyleKey
 	)
 	return null
 }
