import { useEffect, useState } from 'react'
import getCityData, { extractFileName, getThumb } from '@/components/wikidata'
import distance from '@turf/distance'

// This code is mainly used to retrieve wikidata pictures for osm entities that
// don't have a wikidata entry
// It's also used to guess a picture for a destination by it's name since Photon
// probably does not retrieve the wikidata tag
// TODO retrieve more data ! Wikidata is rich
export default function useWikidata(osmFeature, state) {
	console.log('indigo debug', osmFeature)
	const lonLat = osmFeature && osmFeature.center.geometry.coordinates

	const [wikidata, setWikidata] = useState(null)
	const vers = state.slice(-1)[0]

	useEffect(() => {
		if (!osmFeature) return // We're waiting for osmFeature first, since it can contain the wikidata tag, way more precise than guessing the wikidata from the name, treated in the other hook
		if (osmFeature.tags?.wikidata || osmFeature.tags?.wikimedia_commons) return

		const osmName = osmFeature.tags?.name
		const name = vers?.choice?.name || osmName
		console.log('brown', name)
		if (!name) return

		setWikidata(null)
		getCityData(name, false).then((json) => {
			const firstResult = json?.results?.bindings[0]

			if (!firstResult) return
			const wikimediaUrl = firstResult?.pic?.value

			if (!wikimediaUrl) return
			const pictureName = extractFileName(decodeURI(wikimediaUrl))
			const pictureUrl = getThumb(pictureName, 500)

			if (lonLat) {
				const coordinatesValue = firstResult.coordinates?.value,
					foundLonLat =
						coordinatesValue &&
						coordinatesValue.startsWith('Point(') &&
						coordinatesValue
							.slice(6, -1)
							.split(' ')
							.map((el) => +el)

				const distanceFromSource = foundLonLat && distance(foundLonLat, lonLat)

				console.log('data3 lon', lonLat, foundLonLat, distanceFromSource)

				if (distanceFromSource > 10) return
			}

			setWikidata({ pictureName, lonLat, pictureUrl })
		})
	}, [vers, osmFeature, setWikidata, lonLat && lonLat.join('|')])

	useEffect(() => {
		if (!osmFeature?.tags?.wikidata) return

		setWikidata(null)

		const id = osmFeature.tags.wikidata

		const doFetch = async () => {
			const request = await fetch(
				`https://www.wikidata.org/w/rest.php/wikibase/v0/entities/items/${id}`
			)
			const json = await request.json()
			if (!json.statements) return

			const p18 = json.statements.P18
			const pictureStatement = p18 && p18[0]
			if (!pictureStatement) return
			const pictureName = pictureStatement.value.content

			const pictureUrl = getThumb(pictureName, 500)
			setWikidata({ pictureName, pictureUrl, ...json })
		}

		doFetch()
	}, [osmFeature, setWikidata])

	return wikidata
}
