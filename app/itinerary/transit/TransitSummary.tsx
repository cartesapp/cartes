import { getTransitLegs } from '@/app/itinerary/transit/motisRequest'
import transitIcon from '@/public/transit.svg'
import { styled } from 'next-yak'
import Image from 'next/image'
import BestConnection from './BestConnection'
import {
	NoMoreTransitToday,
	NoTransit,
	TransitScopeLimit,
} from './NoTransitMessages'
import { TimelineTransportBlock } from './Transit'
import TransitLoader from './TransitLoader'
import findBestConnection from './findBestConnection'
import { filterNextConnections } from './utils'

export default function TransitSummary({ itinerary }) {
	const data = itinerary.routes.transit
	if (!data) return null // Too short of a distance to use transit
	if (data.state === 'loading') return <TransitLoader />
	if (data.state === 'error')
		return (
			<section>
				<NoTransit reason={data.reason} solution={data.solution} />
			</section>
		)
	if (!data?.itineraries || !data.itineraries.length)
		return <TransitScopeLimit />

	// from now on, itineraries are called connections, Motis v1's term. Not to be
	// mixed up with our "itinerary" prop
	const nextConnections = filterNextConnections(
		data.itineraries,
		itinerary.date
	)
	if (nextConnections.length < 1)
		return <NoMoreTransitToday date={itinerary.date} />

	const bestConnection = findBestConnection(nextConnections)
	if (bestConnection) return <BestConnection bestConnection={bestConnection} />

	console.log('indigo summary', nextConnections)
	const transitConnections = nextConnections
			.map((connection) => getTransitLegs(connection))
			.filter((item) => item.length > 0),
		found = transitConnections.length > 0

	return (
		<Wrapper>
			<div>
				<Image src={transitIcon} alt="Icône transport en commun" />
			</div>
			<p>Voir les {nextConnections.length} options de transport en commun</p>
			<div>
				{nextConnections.map((connection) => (
					<li key={connection.startTime + connection.duration}>
						<TimelineTransportBlock transport={getTransitLegs(connection)[0]} />
					</li>
				))}
			</div>
		</Wrapper>
	)
}

const Wrapper = styled.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	img {
		width: 1.6rem;
		height: auto;
	}
	p {
		margin: 0;
	}
	margin: 0.6rem;
	> div {
		background: var(--lighterColor);
		border-radius: 1rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 0.4rem;
		img {
			filter: invert(1);
			width: 1.8rem;
			height: auto;
		}
	}
`
