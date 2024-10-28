import { useEffect, useState } from 'react'
import { photonServerUrl } from '../serverUrls'

export default function useGeocodeRightClick(stringClickedPoint) {
	const [data, setData] = useState(null)
	useEffect(() => {
		if (!stringClickedPoint) {
			setData(null)
			return
		}
		const clickedPoint = stringClickedPoint.split('|')

		const doFetch = async () => {
			const request = await fetch(
				`${photonServerUrl}/reverse?lon=${clickedPoint[1]}&lat=${clickedPoint[0]}`
			)
			const json = await request.json()

			const result = {
				latitude: +clickedPoint[0],
				longitude: +clickedPoint[1],
				data: json,
			}
			setData(result)
		}
		doFetch()
	}, [stringClickedPoint, setData])

	return data
}
