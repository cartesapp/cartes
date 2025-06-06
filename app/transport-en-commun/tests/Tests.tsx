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
import { TransitSummaryContent } from '@/app/itinerary/transit/TransitSummary'
import { getFetchUrlBase } from '@/app/serverUrls'
import Link from 'next/link'
import { styled } from 'next-yak'

const date = initialDate()
export default function Tests() {
	const [tests, setTests] = useState(métropoles.slice(0, 10))
	useEffect(() => {
		tests.map(async (test) => {
			const allez = new URLSearchParams(new URL(test.url).search).get('allez')

			const search = new URL(test.url).search
			const localUrl = getFetchUrlBase() + '/' + search

			const split = splitAllez(allez)

			const promises = split.map((point) => stepOsmRequest(point))
			const state = await Promise.all(promises)

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
						test2.name === test.name
							? { ...test, itineraries, localUrl }
							: test2
					)
				)
			} catch (e) {
				console.log('indigo toups', e)
			}
		})
	}, [setTests])
	console.log('indigo t', tests)
	return (
		<Ol>
			{tests.map(({ name, url, itineraries, localUrl }) => (
				<li key={name}>
					<h2>{name}</h2>
					{itineraries === undefined && <div>Chargement...</div>}
					{itineraries !== undefined &&
						(itineraries.length ? (
							<TransitSummaryContent connections={itineraries} date={date} />
						) : (
							<div>🚫 Rien trouvé</div>
						))}
					{localUrl && <Link href={localUrl}>🗺️ Voir sur la carte</Link>}
				</li>
			))}
		</Ol>
	)
}

const Ol = styled.ol`
	display: flex;
	gap: 1rem;
	flex-wrap: wrap;
	list-style-type: none;
	> li {
		h2 {
			font-size: 105%;
			margin: 0;
		}
		border-radius: 0.4rem;
		margin: 0.6rem 0;
		width: calc(50% - 2rem);
		background: var(--lightestColor);
		padding: 0 0.4rem;
	}
`
