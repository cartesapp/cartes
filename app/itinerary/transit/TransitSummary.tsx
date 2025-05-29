import { filterTransitLegs } from '@/app/itinerary/transit/motisRequest'
import { styled } from 'next-yak'
import BestConnection from './BestConnection'
import { NoMoreTransitToday, NoTransit } from './NoTransitMessages'
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
	/* TODO this does not seem to be possible with Motis v2 anymore. The
	 * itineraries attribute is always there with potentially length === 0
	 * It doesn't tell us if there's an agency here. But we could use our agency
	 * plans to check that, quite easily
	if (!data?.itineraries || !data.itineraries.length)
		return <TransitScopeLimit />
		*/

	// from now on, itineraries are called connections, Motis v1's term. Not to be
	// mixed up with our "itinerary" prop
	const nextConnections = filterNextConnections(
		data.itineraries,
		itinerary.date
	)
	/* Not sure this is relevant now in Motis v2 */
	if (nextConnections.length < 1)
		return <NoMoreTransitToday date={itinerary.date} />

	const bestConnection = findBestConnection(nextConnections)
	if (bestConnection) return <BestConnection bestConnection={bestConnection} />

	console.log('indigo summary', nextConnections)
	const transitConnections = nextConnections
			.map((connection) => filterTransitLegs(connection))
			.filter((item) => item.legs.length > 0)
			.map((connection) => ({
				...connection,
				signature: connectionSignature(connection),
			})),
		unique = transitConnections.filter((connection, i1) => {
			return !transitConnections.find(
				(connection2, i2) =>
					i1 !== i2 && connection2.signature === connection.signature
			)
		}),
		found = transitConnections.length > 0

	if (!found)
		return (
			<Wrapper>
				Pas de transport trouvé, et nous ne savons pas pourquoi.
			</Wrapper>
		)

	return (
		<Wrapper>
			<div>
				<small>
					{nextConnections.length} option{nextConnections.length > 1 ? 's' : ''}{' '}
					de transport en commun
				</small>
			</div>
			<div>
				<ol>
					{unique.map((connection, i) => (
						<li key={connection.startTime + connection.duration}>
							{i > 0 && <span style={{ margin: '0 .4rem' }}>ou</span>}
							<ol>
								{filterTransitLegs(connection).legs.map((leg) => (
									<li key={leg.name + leg.mode}>
										<TimelineTransportBlock transport={leg} />
									</li>
								))}
							</ol>
						</li>
					))}
				</ol>
			</div>
		</Wrapper>
	)
}
const connectionSignature = (connection) =>
	connection.legs.map((leg) => leg.name).join('<|>')

const Wrapper = styled.div`
	ol {
		list-style-type: none;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		ol li {
			margin: 0 0.1rem;
		}
		> li {
			display: flex;
		}
	}

	margin: 0.6rem;
`
