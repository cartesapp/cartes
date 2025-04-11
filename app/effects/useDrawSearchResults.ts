import { useEffect, useState } from 'react'
import useDrawFeatures from './useDrawFeatures'
import combinedOsmFeaturesRequest from '@/components/osm/combinedOsmFeaturesRequest'

export default function useDrawSearchResults(map, state, setOsmFeature) {
	// Photon search results are not full OSM objectfs, lacking tags, so lacking
	// opening times for instance
	const [features, setFeatures] = useState([])
	const vers = state.slice(-1)[0]
	const results = vers?.results

	const resultsHash = results?.map((el) => el.osmId)

	useEffect(() => {
		if (!map) return

		if (!results) return

		const doFetch = async () => {
			const newFeatures = await combinedOsmFeaturesRequest(results)
			setFeatures(newFeatures)
		}
		doFetch()
		return () => {
			setFeatures([])
		}
	}, [map, setFeatures, resultsHash])

	useDrawFeatures(map, features, false, category, setOsmFeature)
}

const category = {
	name: 'search',
	icon: 'search-result',
	iconSize: 22,
}
