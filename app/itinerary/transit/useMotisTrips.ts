import { useEffect } from 'react'
import polyline from '@mapbox/polyline'

// UNUSED FILE : SHOULD PROBABLY BE DROPPED

export default function useMotisTrip(
	transit,
	selectedConnection,
	setMotisTrips
) {
	const trips =
		transit?.connections && transit.connections[selectedConnection].trips

	useEffect(() => {
		async function doFetch() {
			if (!trips) return
			const json = await computeMotisTrips(trips)

			if (json.state === 'error') return json

			if (!json?.content) return null
			console.log('trips success', json)

			const featureCollection = {
				type: 'FeatureCollection',
				features: json.content.polylines
					.map((line) => line !== '' && polyline.toGeoJSON(line, 6))
					.filter(Boolean)
					.map((geometry) => ({ geometry, type: 'Feature', properties: {} })),
			}
			console.log('trips polylines', featureCollection)

			return json.content
		}
		doFetch()
	}, [trips])
}
