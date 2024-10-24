import { useEffect, useState } from 'react'
import { gtfsServerUrl } from '../serverUrls'
import { findStopId, isNotTransportStop } from './stop/Stop'

export default function useTransportStopData(osmFeature, gtfsStopIds) {
	const [data, setData] = useState([])
	useEffect(() => {
		if (!gtfsStopIds && !(osmFeature && !osmFeature.tags)) return
		if (!gtfsStopIds && isNotTransportStop(osmFeature.tags)) return
		const stopIds = gtfsStopIds?.join('|') || findStopId(osmFeature.tags)

		const doFetch = async () => {
			const response = await fetch(gtfsServerUrl + '/stopTimes/' + stopIds, {
				mode: 'cors',
			})
			const json = await response.json()

			setData(json)
		}
		doFetch()
	}, [setData, osmFeature, gtfsStopIds])
	if (!osmFeature && !gtfsStopIds) return []
	console.log('transportStopData', data)
	return data
}
