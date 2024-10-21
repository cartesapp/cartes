import BestConnection from './BestConnection'
import Image from 'next/image'
import transitIcon from '@/public/transit.svg'
import {
	NoMoreTransitToday,
	NoTransit,
	TransitScopeLimit,
} from './NoTransitMessages'
import TransitLoader from './TransitLoader'
import findBestConnection from './findBestConnection'
import { connectionStart, filterNextConnections } from './utils'
import Link from 'next/link'

export default function TransitSummary({ itinerary }) {
	const data = itinerary.routes.transit
	if (!data) return null // Too short of a distance to use transit
	if (data.state === 'loading') return <TransitLoader />
	if (data.state === 'error')
		return (
			<section>
				<NoTransit reason={data.reason} />
				<button css="margin: 0 0 0 auto; display: block">
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
			css={`
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
			`}
		>
			<Image src={transitIcon} alt="Icône transport en commun" />
			<p>Voir les {nextConnections.length} options de transport en commun</p>
		</div>
	)
}
