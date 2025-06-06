'use client'

import { useEffect, useState } from 'react'
import métropoles from './métropoles.yaml'
import splitAllez from '@/components/itinerary/splitAllez'
import { stepOsmRequest } from '@/app/stepOsmRequest'
import { initialDate } from '@/app/itinerary/transit/utils'
import {
	computeMotisTrip,
	isNotTransitItinerary,
} from '@/app/itinerary/transit/motisRequest'
export default function Tests() {
	const [tests, setTests] = useState(métropoles.slice(0, 3))
	useEffect(() => {
		tests.map(async (test) => {
			const allez = test.url.split('allez=')[1].replace('&mode=commun', '')

			const split = splitAllez(decodeURIComponent(allez))

			const promises = split.map((point) => stepOsmRequest(point))
			const state = await Promise.all(promises)

			const date = initialDate()

			try {
				const start = state[0],
					destination = state[1]

				const [lng, lat] = start.center.geometry.coordinates
				const [lngB, latB] = destination.center.geometry.coordinates

				const json = await computeMotisTrip(
					{ lng, lat },
					{ lng: lngB, lat: latB },
					date
				)

				if (json.state === 'error' || !json.itineraries) {
					console.log(json)
					return new Response(`Motis error`, { status: 500 })
				}
				const { itineraries } = json
				const transitItineraries = itineraries.filter(
					(connection) => !isNotTransitItinerary(connection)
				)
				setTests((oldTests) =>
					oldTests.map((test2) =>
						test2.name === test.name ? { ...test, itineraries } : test2
					)
				)
			} catch (e) {
				console.log('indigo toups', e)
			}
		})
	}, [setTests])
	console.log('indigo t', tests)
	return (
		<ol>
			{tests.map(({ name, url, itineraries }) => (
				<li key={name}>
					<div>{name}</div>
					{itineraries && itineraries.length}
				</li>
			))}
		</ol>
	)
}
