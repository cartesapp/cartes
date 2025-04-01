import { useEffect, useState } from 'react'
import { fetchOverpassRequest, fetchSimilarNodes } from './fetchOverpassRequest'

export default function useOverpassRequest(bbox, categories) {
	const [features, setFeatures] = useState({})

	useEffect(() => {
		if (!bbox || !categories) return

		categories.map(async (category) => {
			const nodeElements = await fetchOverpassRequest(bbox, category)

			setFeatures((features) => ({
				...features,
				[category.name]: nodeElements,
			}))
		})
	}, [
		categories && categories.join((category) => category.name),
		bbox && bbox.join('|'),
	])

	return [features]
}

export function useFetchSimilarNodes(osmFeature, givenSimilarNodes) {
	const [similarNodes, setSimilarNodes] = useState(givenSimilarNodes)

	useEffect(() => {
		const doFetch = async () => {
			if (!osmFeature?.osmCode) return
			const features = await fetchSimilarNodes(osmFeature)
			setSimilarNodes(features)
		}

		doFetch()
	}, [osmFeature?.osmCode])

	return similarNodes
}
