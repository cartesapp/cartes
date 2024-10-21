import { Marker } from 'maplibre-gl'
import { useEffect } from 'react'

export default function useDrawRightClickMarker(map, geocodedClickedPoint) {
	useEffect(() => {
		if (!map || !geocodedClickedPoint) return

		console.log('lightgreen marker', geocodedClickedPoint)

		const lon = geocodedClickedPoint.longitude,
			lat = geocodedClickedPoint.latitude

		if (!lon || !lat) return
		const marker = new Marker({
			color: 'var(--color)',
			//draggable: true,
		})
			.setLngLat([lon, lat])
			.addTo(map)

		// Apple Maps has a nice haptic vibration feedback.
		// https://il.ly/tech/vibrate-mobile-phone-web-vibration-api#vibration-api-browser-support
		// I don't think this is much supported. Test Android Firefox, Bromite,
		// Lineageos navigator, iOS firefox, iOS safari : no one works.
		// navigator.vibrate(200)

		return () => {
			marker.remove()
		}
	}, [map, geocodedClickedPoint])
}
