import { goodIconSize } from '@/components/mapUtils'
import { sortBy } from '@/components/utils/utils'
import maplibregl from 'maplibre-gl'
import { useEffect, useState } from 'react'
import { gtfsServerUrl } from '../serverUrls'
import {
	addMinutes,
	dateFromHHMMSS,
	humanDepartureTime,
	nowAsYYMMDD,
} from '../transport/stop/Route'

export default function useSearchLocalTransit(map, active, center, zoom) {
	const [stops, setStops] = useState([])
	const [stopTimes, setStopTimes] = useState({})
	const notZoomEnough = zoom < 15

	const day = nowAsYYMMDD()
	const [from, setFrom] = useState(null)
	const [to, setTo] = useState(null)

	useEffect(() => {
		const intervalFunction = () => {
			const d = new Date()
			const from = d.toLocaleTimeString()
			const to = addMinutes(d, 60).toLocaleTimeString()

			setFrom(from)
			setTo(to)
		}

		intervalFunction()
		setInterval(intervalFunction, 10000)
		return () => {
			clearInterval(intervalFunction)
		}
	}, [setFrom, setTo])

	useEffect(() => {
		if (!active || !center || notZoomEnough) return
		const [longitude, latitude] = center,
			distance = 200

		const url = `${gtfsServerUrl}/geoStops/${latitude}/${longitude}/${distance}`

		const doFetch = async () => {
			const request = await fetch(url)
			const json = await request.json()
			setStops(json)
		}

		doFetch()
	}, [active, center, setStops, notZoomEnough])

	useEffect(() => {
		if (!stops.length) return

		const doFetch = () => {
			stops.map(async (stop) => {
				const id = stop.stop_id
				const url = `${gtfsServerUrl}/immediateStopTimes/${id}/${day}/${from}/${to}`
				const request = await fetch(url)
				const json = await request.json()
				setStopTimes((stopTimes) => ({ ...stopTimes, [id]: json }))
			})
		}
		doFetch()
	}, [stops, setStopTimes, from, to])

	useEffect(() => {
		if (!map || !stops.length || !active || notZoomEnough) return

		const markers = stops.map((stop) => {
			const times = stopTimes[stop.stop_id]

			if (!times || !times.length) return null
			const routes = Object.entries(
				times.reduce((memo, next) => {
					return {
						...memo,
						[next.route_id]: [...(memo[next.route_id] || []), next],
					}
				}, {})
			)
			console.log('red stopTimes', routes)

			const jsx = `<div><div style="padding: 0 .2rem; ">${stop.stop_name}</div>
${
	routes.length
		? `
				<ul style="list-style-type: none">${routes
					.map(([_, routeTimes]) => {
						const route = routeTimes[0]
						return `<li style="${`
							padding: 0 .2rem;
							  background: #${route.route_color};
								color: #${route.route_text_color || 'white'}`}">

<strong>
						${route.route_short_name}
						</strong>
						<small>${sortBy((time) => time.arrival_time)(routeTimes)
							.slice(0, 1)
							.map((time) =>
								humanDepartureTime(dateFromHHMMSS(time.arrival_time))
							)}</small>

						</li>`
					})
					.join('')}</ul>`
		: ''
}</div>`

			const element = document.createElement('div')
			const size = goodIconSize(zoom, 1.3) + 'px'

			element.style.cssText = `
			display: block;
			background: var(--lightestColor2);
			width: ${size}; height: auto;
border-radius: .4rem; overflow: hidden; border: 2px solid var(--darkerColor);   --shadow-color: 46deg 14% 62%;
  --shadow-elevation-low:
    0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.34),
    0.4px 0.8px 1px -1.2px hsl(var(--shadow-color) / 0.34),
    1px 2px 2.5px -2.5px hsl(var(--shadow-color) / 0.34); box-shadow: var(--shadow-elevation-low)
			`
			element.innerHTML = jsx

			element.addEventListener('click', () => {
				console.log(stop)
			})

			const marker = new maplibregl.Marker({ element })
				.setLngLat({ lng: stop.stop_lon, lat: stop.stop_lat })
				.addTo(map)

			return marker
		})
		return () => {
			markers.map((marker) => marker?.remove())
		}
	}, [map, stops, stopTimes, zoom, notZoomEnough, active])
}
