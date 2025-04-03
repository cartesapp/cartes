import { useEffect, useState } from 'react'
import useDrawFeatures from '../effects/useDrawFeatures'
import { buildOverpassRequest } from '../effects/fetchOverpassRequest'
import { overpassRequestSuffix } from '../osmRequest'

const category = {
	name: 'Arceaux vélo',
	icon: 'parking',
	group: 'Déplacements',
	'open by default': true,
}

const radius = 120 // metres
const getLastPoint = (features) => features[0].geometry.coordinates.slice(-1)[0]
export default function useFetchDrawBikeParkings(map, cycling) {
	const [features, setFeatures] = useState(null)
	const lastPoint = cycling?.features && getLastPoint(cycling.features)

	const queryCore =
		lastPoint &&
		`
  node(around:${radius}, ${lastPoint[1]}, ${lastPoint[0]})["bicycle_parking"];
		`

	useEffect(() => {
		if (!queryCore) return

		const doFetch = async () => {
			const body = buildOverpassRequest(queryCore)
			const url = `${overpassRequestSuffix}${encodeURIComponent(body)}`
			const request = await fetch(url)
			const json = await request.json()

			console.log('vélo', json)

			setFeatures(json.elements)
		}
		doFetch()

		// search area
		//
		// overpass bbox
		// overpass query -> points
		// draw on map -> v1
	}, [queryCore, setFeatures])

	const backgroundColor = '#57bff5'
	useDrawFeatures(
		map,
		cycling && features,
		false,
		category,
		() => null,
		backgroundColor
	)
}
