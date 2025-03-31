import { useEffect, useState } from 'react'
import { gtfsServerUrl } from '../serverUrls'

export default function useTransportStopData(osmFeature, gtfsStopIds) {
	const [data, setData] = useState([])
	console.log('purple useTransportStopData', data)

	useEffect(() => {
		if (gtfsStopIds || !osmFeature) return
		const { lat, lon } = osmFeature
		if (!lat || !lon) return

		const doFetch = async () => {
			try {
				const url =
					gtfsServerUrl + `/geoStops/${osmFeature.lat}/${osmFeature.lon}/50`
				const response = await fetch(url, {
					mode: 'cors',
				})

				const json = await response.json()

				if (!json || !json.length) return
				const firstMatchId = json[0].stop_id

				const firstMatchResponse = await fetch(
					gtfsServerUrl + `/stopTimes/${firstMatchId}`,
					{
						mode: 'cors',
					}
				)
				const firstMatch = await firstMatchResponse.json()

				console.log('magenta stops for request ', url, json, firstMatch)

				setData(firstMatch)
			} catch (e) {
				console.log('Error fetching GTFS stop and stop times by coordinates')
			}
		}
		doFetch()
	}, [setData, osmFeature, gtfsStopIds])
	useEffect(() => {
		if (!gtfsStopIds) return

		const stopIds = gtfsStopIds?.join('|')

		console.log('indigo stopIds without search', stopIds)
		const doFetch = async () => {
			const response = await fetch(gtfsServerUrl + '/stopTimes/' + stopIds, {
				mode: 'cors',
			})
			const json = await response.json()

			setData(json)
		}
		doFetch()
	}, [setData, osmFeature, gtfsStopIds])
	/* See findStopId's note !
	useEffect(() => {
		console.log('indigo osmFeature, gtfsStopIds', osmFeature, gtfsStopIds)
		if (!gtfsStopIds && !(osmFeature && osmFeature.tags)) return
		if (!gtfsStopIds && isNotTransportStop(osmFeature.tags)) return
		const stopIds = gtfsStopIds?.join('|') || findStopId(osmFeature.tags)

		console.log('indigo stopIds', stopIds)
		const doFetch = async () => {
			const response = await fetch(gtfsServerUrl + '/stopTimes/' + stopIds, {
				mode: 'cors',
			})
			const json = await response.json()

			setData(json)
		}
		doFetch()
	}, [setData, osmFeature, gtfsStopIds])
	*/
	if (!osmFeature && !gtfsStopIds) return []
	return data
}
