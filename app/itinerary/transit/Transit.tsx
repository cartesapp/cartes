import { isOverflowX } from '@/components/css/utils'
import DetailsButton from '@/components/transit/DetailsButton'
import TransitInstructions from '@/components/transit/TransitInstructions'
import TransitOptions from '@/components/transit/TransitOptions'
import useSetSearchParams from '@/components/useSetSearchParams'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useResizeObserver } from 'usehooks-ts'
import DateSelector from '../DateSelector'
import BestConnection from './BestConnection'
import { LateWarning } from './LateWarning'
import {
	NoMoreTransitToday,
	NoTransit,
	TransitScopeLimit,
} from './NoTransitMessages'
import TransitLoader from './TransitLoader'
import TransportMoveBlock from './TransportMoveBlock'
import findBestConnection from './findBestConnection'
import {
	connectionEnd,
	connectionStart,
	filterNextConnections,
	formatMotis,
	humanDuration,
} from './utils'
import { css, styled } from 'next-yak'
import { Line } from './Line'

/* This is a megacomponent. Don't worry, it'll stay like this until the UX
 * decisions are stabilized. We don't have many users yet */

export default function Transit({ itinerary, searchParams }) {
	const date = itinerary.date

	console.log('indigo transit yo', itinerary)

	return (
		<div
			css={css`
				margin-top: 0.4rem;
				ul {
					list-style-type: none;
				}
				input {
					margin: 0 0 0 auto;
					display: block;
				}
			`}
		>
			<DateSelector date={date} planification={searchParams.planification} />
			<TransitOptions searchParams={searchParams} />
			<TransitContent {...{ itinerary, searchParams, date }} />
		</div>
	)
}

const TransitContent = ({ itinerary, searchParams, date }) => {
	const data = itinerary.routes.transit
	if (!data) return
	if (data.state === 'loading') return <TransitLoader />
	if (data.state === 'error')
		return <NoTransit reason={data.reason} solution={data.solution} />

	if (!data?.connections || !data.connections.length)
		return <TransitScopeLimit />

	const nextConnections = filterNextConnections(data.connections, date)

	console.log('lightpurple transit', data.connections, nextConnections)
	if (nextConnections.length < 1) return <NoMoreTransitToday date={date} />

	const firstDate = connectionStart(nextConnections[0]) // We assume Motis orders them by start date, when you start to walk. Could also be intersting to query the first end date

	const bestConnection = findBestConnection(nextConnections)

	const firstStop = Math.min(
			...nextConnections.map(
				(connection) => connection.stops[0].departure.schedule_time
			)
		),
		lastStop = Math.max(
			...nextConnections.map(
				(connection) => connection.stops.slice(-1)[0].arrival.schedule_time
			)
		)

	const chosen = searchParams.details === 'oui' && searchParams.choix
	return (
		<section>
			<div
				css={css`
					p {
						text-align: right;
					}
				`}
			>
				<LateWarning firstDate={firstDate} date={data.date} />
			</div>
			{!chosen ? (
				<section>
					{bestConnection && <BestConnection bestConnection={bestConnection} />}

					<TransitTimeline
						connections={nextConnections}
						date={data.date}
						choix={searchParams.choix}
						selectedConnection={searchParams.choix || 0}
						connectionsTimeRange={{
							from: firstStop,
							to: lastStop,
						}}
					/>
				</section>
			) : (
				<TransitInstructions connection={nextConnections[chosen]} />
			)}
		</section>
	)
}

const TransitTimelineWrapper = styled.div`
	margin-top: 1rem;
	overflow-x: scroll;
	> ul {
		width: ${(p) => p.$width}%;
		min-width: 100%;
	}
`
const TransitTimeline = ({
	connections,
	date,
	connectionsTimeRange,
	selectedConnection,
	choix,
}) => {
	const setSearchParams = useSetSearchParams()

	/* The request result's latest arrival date, usually too far, makes everything
	 * small
	 */
	const endTime = Math.max(
		...connections.map(({ stops }) => stops.slice(-1)[0].arrival.time)
	)

	const quickestConnection = connections.reduce(
			(memo, next) => (next.seconds < memo.seconds ? next : memo),
			{ seconds: Infinity }
		),
		quickest = quickestConnection.seconds

	const range = connectionsTimeRange.to - connectionsTimeRange.from

	/*
	 * quickest ->  60 % width
	 * range -> total %
	 * */
	return (
		<TransitTimelineWrapper $width={((range * 0.6) / quickest) * 100}>
			<ul>
				{connections.map((el, index) => (
					<Connection
						key={index}
						connection={el}
						endTime={endTime}
						date={date}
						selected={+selectedConnection === index}
						setSelectedConnection={(choix) => setSearchParams({ choix })}
						index={index}
						choix={choix}
						connectionsTimeRange={connectionsTimeRange}
					/>
				))}
			</ul>
		</TransitTimelineWrapper>
	)
}

const correspondance = { Walk: 'Marche', Transport: 'Transport' }

const ConnectionLi = styled.li`
	margin-bottom: 0.1rem;
	cursor: pointer;
	> div {
		${(p) =>
			p.$selected &&
			css`
				border: 2px solid var(--lighterColor);
				background: var(--lightestColor);
			`}
	}
`
const Connection = ({
	connection,
	endTime,
	date,
	setSelectedConnection,
	index,
	choix,
	connectionsTimeRange,
	selected,
}) => {
	return (
		<ConnectionLi
			$selected={selected}
			onClick={() => setSelectedConnection(index)}
		>
			<Line
				connectionsTimeRange={connectionsTimeRange}
				transports={connection.transports}
				connection={connection}
				connectionRange={[
					connectionStart(connection),
					connectionEnd(connection),
				]}
				choix={choix}
				index={index}
				componentMode="transit"
			/>
		</ConnectionLi>
	)
}

const TimelineTransportBlockWrapper = styled.span`
	${(p) =>
		p.$constraint == 'smallest' &&
		css`
			strong {
				border: 2px solid white;
				z-index: 1;
			}
		`}
	display: inline-block;
	width: 100%;
	background: ${(p) => p.$background};
	height: 100%;
	display: flex;
	justify-content: center;
	padding: 0.2rem 0;
	border-radius: 0.2rem;
	img {
		display: ${(p) => (p.$displayImage ? 'block' : 'none')};
		height: 0.8rem;
		width: auto;
		margin-right: 0.2rem;
	}
	${(p) =>
		p.$moveType === 'Walk' &&
		css`
			border-bottom: 4px dotted #5c0ba0;
		`}
`
// The code in this component is a mess. We're handling Motis's transport types
// + our own through brouter and valhalla. A refactoring should be done at some
// point
export const TimelineTransportBlock = ({ transport }) => {
	console.log('lightgreen TimelineTransportBlock', transport)
	const [constraint, setConstraint] = useState('none')
	const background = transport.route_color

	const ref = useRef<HTMLDivElement>(null)
	const { width = 0, height = 0 } = useResizeObserver({
		ref,
		box: 'border-box',
	})
	const isOverflow = isOverflowX(ref.current)

	const displayImage = constraint === 'none'

	useEffect(() => {
		if (isOverflow)
			setConstraint(constraint === 'none' ? 'noImage' : 'smallest')
	}, [setConstraint, isOverflow, constraint])

	return (
		<TimelineTransportBlockWrapper
			$background={background}
			$constraint={constraint}
			$displayImage={displayImage}
			$moveType={transport.move_type}
			ref={ref}
			title={`${humanDuration(transport.seconds).single} de ${
				transport.frenchTrainType ||
				transport.move?.name ||
				(transport.move?.mumo_type === 'car'
					? 'voiture'
					: transport.move_type === 'Cycle' ||
					  transport.move?.mumo_type === 'bike'
					? 'vélo'
					: 'marche')
			} ${transport.route_long_name || ''}`}
		>
			{transport.move?.name ? (
				<TransportMoveBlock transport={transport} />
			) : transport.move_type === 'Walk' &&
			  transport.move?.mumo_type === 'car' ? (
				<Image
					src={'/car.svg'}
					alt="Icône d'une voiture"
					width="100"
					height="100"
					css={css`
						height: 1.4rem !important;

						margin: 0 !important;
					`}
				/>
			) : transport.move_type === 'Cycle' ||
			  (transport.move_type === 'Walk' &&
					transport.move?.mumo_type === 'bike') ? (
				<Image
					src={'/cycling.svg'}
					alt="Icône d'un vélo"
					width="100"
					height="100"
					css={css`
						height: 1.6rem !important;
						margin: -0.1rem 0 0 0 !important;
						filter: invert(1);
					`}
				/>
			) : transport.move_type === 'Walk' ||
			  transport.move?.mumo_type === 'foot' ? (
				<Image
					src={'/walking.svg'}
					alt="Icône d'une personne qui marche"
					width="100"
					height="100"
					css={css`
						height: 1.4rem !important;
						margin: -0.1rem 0 0 0 !important;
					`}
				/>
			) : (
				correspondance[transport.move_type]
			)}
		</TimelineTransportBlockWrapper>
	)
}
