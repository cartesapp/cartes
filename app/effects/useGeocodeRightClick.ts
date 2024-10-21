import { useEffect, useState } from 'react'

export default function useGeocodeRightClick(stringClickedPoint) {
	const [data, setData] = useState(null)
	useEffect(() => {
		if (!stringClickedPoint) {
			setData(null)
			return
		}
		const clickedPoint = stringClickedPoint.split('|')

		const latitude = +clickedPoint[0],
			longitude = +clickedPoint[1]

		setData({ latitude, longitude, data: null })
		const doFetch = async () => {
			const request = await fetch(
				`https://serveur.cartes.app/photon/reverse?lon=${clickedPoint[1]}&lat=${clickedPoint[0]}`
			)
			const json = await request.json()

			const result = {
				latitude,
				longitude,
				data: json,
			}
			setData(result)
		}
		doFetch()
	}, [stringClickedPoint, setData])

	return data
}
