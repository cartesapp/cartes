import { useEffect, useState } from 'react'

export default function useIcons() {
	const [bulkImages, setBulkImages] = useState({})
	useEffect(() => {
		const doFetch = async () => {
			const request = await fetch('/svgo/bulk', { cache: 'force-cache' })
			const json = await request.json()

			setBulkImages(Object.fromEntries(json))
		}
		doFetch()
	}, [setBulkImages])

	return bulkImages
}
