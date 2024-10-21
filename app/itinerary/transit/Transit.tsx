import { isOverflowX } from '@/components/css/utils'
import DetailsButton from '@/components/transit/DetailsButton'
import TransitInstructions from '@/components/transit/TransitInstructions'
import useSetSearchParams from '@/components/useSetSearchParams'
import { findContrastedTextColor } from '@/components/utils/colors'
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
import TransitOptions from '@/components/transit/TransitOptions'
import TransportMoveBlock from './TransportMoveBlock'
import findBestConnection from './findBestConnection'
import {
	connectionEnd,
	connectionStart,
	filterNextConnections,
	formatMotis,
	humanDuration,
} from './utils'

/* This is a megacomponent. Don't worry, it'll stay like this until the UX
 * decisions are stabilized. We don't have many users yet */

export default function Transit({ itinerary, searchParams }) {
	const date = itinerary.date

	return (
		<div
			css={`
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
			<DateSelector date={date} />
			<TransitOptions searchParams={searchParams} />
			<TransitContent {...{ itinerary, searchParams, date }} />
		</div>
	)
}

const TransitContent = ({ itinerary, searchParams, date }) => {
	const data = itinerary.routes.transit
	if (!data) return
	if (data.state === 'loading') return <TransitLoader />
	if (data.state === 'error') return <NoTransit reason={data.reason} />

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
				css={`
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
		<div
			css={`
				margin-top: 1rem;
				overflow-x: scroll;
				> ul {
					width: ${((range * 0.6) / quickest) * 100}%;
					min-width: 100%;
				}
			`}
		>
			<ul>
				{connections.map((el, index) => (
					<Connection
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
		</div>
	)
}

const correspondance = { Walk: 'Marche', Transport: 'Transport' }

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
		<li
			css={`
				margin-bottom: 0.1rem;
				cursor: pointer;
				> div {
					${selected && `border: 2px solid var(--color);`}
				}
			`}
			onClick={() => setSelectedConnection(index)}
		>
			{' '}
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
		</li>
	)
}

export const Line = ({
	connectionsTimeRange,
	connection,
	connectionRange: [from, to],
	transports,
	choix,
	index,
	componentMode,
}) => {
	const setSearchParams = useSetSearchParams()
	console.log('lightgreen line', transports, setSearchParams)
	const { from: absoluteFrom, to: absoluteTo } = connectionsTimeRange
	const length = absoluteTo - absoluteFrom

	const barWidth = ((to - from) / length) * 100,
		left = ((from - absoluteFrom) / length) * 100

	const animatedScrollRef = useRef()
	return (
		<div
			onClick={() =>
				animatedScrollRef.current.scrollIntoView({
					behavior: 'smooth',
					inline: 'start',
					block: 'center',
				})
			}
			css={`
				height: 4rem;
				width: calc(100% - 1rem);
				padding: 0.4rem 0;
				margin: 0;
				margin-top: 0.3rem;
				position: relative;
				display: flex;
				align-items: center;
				background: white;
			`}
		>
			<div
				ref={animatedScrollRef}
				css={`
					position: absolute;
					left: calc(0.6rem + ${left}%);
					width: calc(${barWidth}% - 1rem);
					top: 50%;
					transform: translateY(-50%);
				`}
			>
				<ul
					css={`
						display: flex;
						justify-content: space-evenly;
						list-style-type: none;
						align-items: center;
						width: 100%;
					`}
				>
					{transports.map((transport) => (
						<li
							key={transport.shortName}
							css={`
								width: ${(transport.seconds / connection.seconds) * 100}%;
								height: 1.8rem;
								border-right: 2px solid white;
							`}
						>
							<TimelineTransportBlock transport={transport} />
						</li>
					))}
				</ul>

				{componentMode === 'transit' &&
					((!choix && index === 0) || choix == index) && (
						<div
							css={`
								position: absolute;
								right: -3rem;
								top: 50%;
								transform: translateY(-50%);
								font-size: 200%;
								a {
									text-decoration: none;
								}
							`}
						>
							<DetailsButton
								link={setSearchParams({ choix, details: 'oui' }, true)}
							/>
						</div>
					)}
				<div
					css={`
						margin-top: 0.1rem;
						display: flex;
						justify-content: space-between;
						line-height: 1.2rem;
					`}
				>
					<small>{formatMotis(from)}</small>
					<small
						css={`
							color: #555;
						`}
					>
						{to - from > 25 * 60 // 10 minutes TODO this should be calculated : does it fit ?? show '-' and title=
							? humanDuration(connection.seconds).single
							: ' - '}
					</small>
					<small>{formatMotis(to)}</small>
				</div>
			</div>
		</div>
	)
}

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
		<span
			ref={ref}
			css={`
				${constraint == 'smallest' &&
				`
		  strong {
			  border: 2px solid white;
				z-index: 1
		  }
			`}
				display: inline-block;
				width: 100%;
				background: ${background};
				height: 100%;
				display: flex;
				justify-content: center;
				padding: 0.2rem 0;
				border-radius: 0.2rem;
				img {
					display: ${displayImage ? 'block' : 'none'};
					height: 0.8rem;
					width: auto;
					margin-right: 0.2rem;
				}
				${transport.move_type === 'Walk' && `border-bottom: 4px dotted #5c0ba0`}
			`}
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
					css={`
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
					css={`
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
					css={`
						height: 1.4rem !important;
						margin: -0.1rem 0 0 0 !important;
					`}
				/>
			) : (
				correspondance[transport.move_type]
			)}
		</span>
	)
}
