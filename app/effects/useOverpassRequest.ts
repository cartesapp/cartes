import { useEffect, useState } from 'react'
import {
	fetchOverpassCategoryRequest,
	fetchSimilarNodes,
} from './fetchOverpassRequest'

export default function useOverpassRequest(bbox, categories) {
	const [features, setFeatures] = useState({})

	useEffect(() => {
		if (!bbox || !categories) return
		if (categories.length == 0) return
		categories.map(async (category) => {
			const nodeElements = await fetchOverpassCategoryRequest(bbox, category)

			setFeatures((features) => ({
				...features,
				[category.key]: nodeElements,
			}))
		})
	}, [
		categories && categories.join((category) => category.key),
		bbox && bbox.join('|'),
	])

	return [features]
}

export function useFetchSimilarNodes(step, givenSimilarNodes) {
	const [similarNodes, setSimilarNodes] = useState(givenSimilarNodes)

	useEffect(() => {
		if (!step?.osmCode) return
		const doFetch = async () => {
			const features = await fetchSimilarNodes(step)
			setSimilarNodes(features)
		}

		doFetch()
	}, [step?.osmCode])

	return similarNodes
}
