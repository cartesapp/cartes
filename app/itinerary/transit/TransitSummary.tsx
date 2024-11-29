import transitIcon from '@/public/transit.svg'
import Image from 'next/image'
import BestConnection from './BestConnection'
import {
	NoMoreTransitToday,
	NoTransit,
	TransitScopeLimit,
} from './NoTransitMessages'
import TransitLoader from './TransitLoader'
import findBestConnection from './findBestConnection'
import { connectionStart, filterNextConnections } from './utils'
import { css } from 'next-yak'

export default function TransitSummary({ itinerary }) {
	const data = itinerary.routes.transit
	if (!data) return null // Too short of a distance to use transit
	if (data.state === 'loading') return <TransitLoader />
	if (data.state === 'error')
		return (
			<section>
				<NoTransit reason={data.reason} solution={data.solution} />
				<button
					css={css`
						margin: 0 0 0 auto;
						display: block;
					`}
				>
					→ Choisir une date
				</button>
			</section>
		)
	if (!data?.connections || !data.connections.length)
		return <TransitScopeLimit />

	const nextConnections = filterNextConnections(
		data.connections,
		itinerary.date
	)
	if (nextConnections.length < 1)
		return <NoMoreTransitToday date={itinerary.date} />

	const firstDate = connectionStart(nextConnections[0]) // We assume Motis orders them by start date, when you start to walk. Could also be intersting to query the first end date
	const bestConnection = findBestConnection(nextConnections)
	if (bestConnection) return <BestConnection bestConnection={bestConnection} />
	return (
		<div
			css={css`
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
			`}
		>
			{' '}
			<div>
				<Image src={transitIcon} alt="Icône transport en commun" />
			</div>
			<p>Voir les {nextConnections.length} options de transport en commun</p>
		</div>
	)
}
