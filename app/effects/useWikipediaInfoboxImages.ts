import { useCallback, useEffect, useState } from 'react'
import { getFetchUrlBase } from '../serverUrls'

export default function useWikipediaInfoboxImages(osmFeature) {
	const [data, setData] = useState(null)

	useEffect(() => {
		if (!osmFeature) return // We're waiting for osmFeature first, since it can contain the wikidata tag, way more precise than guessing the wikidata from the name, treated in the other hook

		const name = osmFeature.tags?.wikipedia
		if (!name) return
		const [lang, title] = name.split(':')

		const doFetch = async () => {
			const images = await fetchWikipediaInfoboxImages(lang, title)
			console.log('brown images', images)
			setData(images)
		}

		doFetch()

		setData(null)
	}, [setData, osmFeature])

	const reset = useCallback(() => setData(null), [setData])
	return [data, reset]
}

const fetchWikipediaInfoboxImages = async (lang, title) => {
	if (!lang || !title) return null
	try {
		// Fetch HTML content of the given webpage
		const urlBase = getFetchUrlBase()

		const response = await fetch(
			urlBase +
				'/scrapWikipediaInfobox?url=' +
				encodeURIComponent(`${lang}.wikipedia.org/wiki/${title}`),
			{
				cache: 'force-cache',
			}
		)
		const images = await response.json()

		return images
	} catch (error) {
		console.log('Error fetching OG image :', error)
	}
}
