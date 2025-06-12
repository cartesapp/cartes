'use client'
import { useState } from 'react'
import { styled } from 'next-yak'
import {
	htmlDatetimeLocalValueDecoder,
	htmlDatetimeLocalValueEncoder,
	initialDate,
} from './itinerary/transit/utils'

export default function GareInfo({ nom, uic8 }) {
	const [rawDate, setDate] = useState(initialDate('date'))

	const date = htmlDatetimeLocalValueDecoder(rawDate)
	const iframeDate = date.slice(0, 16)

	console.log('gareinfo', date)
	return (
		<Wrapper>
			<input
				type="datetime-local"
				id="trainDate"
				name="trainDate"
				value={date}
				min={initialDate()}
				onChange={(e) => setDate(e.target.value)}
			/>
			<h2>
				{nom.toLowerCase().includes('gare de') ? (
					nom
				) : (
					<span>Gare de {nom}</span>
				)}
			</h2>

			<iframe
				src={`https://tableau-sncf.vercel.app/station/stop_area:SNCF:${uic8}?date=${iframeDate}`}
			/>
		</Wrapper>
	)
}

const Wrapper = styled.section`
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 70vh;

	iframe {
		width: 100%;
		border: 4px solid var(--darkerColor);
		border-radius: 4px;
		height: 100%;
	}
	h2 {
		color: white;
		margin-bottom: 0rem;
		font-size: 140%;
		background: var(--darkerColor);
		width: 100%;
		text-align: center;
		padding: 0.2rem 0;
		max-width: 20rem;
		border-top-left-radius: 0.4rem;
		border-top-right-radius: 0.4rem;
	}
	@media (min-width: 1200px) {
		width: 35rem;
		max-width: 100%;
	}
	> input {
		margin-top: 1rem;
	}
`
