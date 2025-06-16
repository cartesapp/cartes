import { isOverflowX } from '@/components/css/utils'
import TransitInstructions from '@/components/transit/TransitInstructions'
import TransitOptions from '@/components/transit/TransitOptions'
import useSetSearchParams from '@/components/useSetSearchParams'
import { css, styled } from 'next-yak'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useResizeObserver } from 'usehooks-ts'
import DateSelector from '../DateSelector'
import BestConnection from './BestConnection'
import { LateWarning } from './LateWarning'
import { Line } from './Line'
import {
	NoMoreTransitToday,
	NoTransit,
	TransitScopeLimit,
} from './NoTransitMessages'
import TransitLoader from './TransitLoader'
import TransportMoveBlock from './TransportMoveBlock'
import findBestConnection from './findBestConnection'
import { filterNextConnections, humanDuration, stamp } from './utils'
import { handleColor } from './colors'
import SlowTransit from './SlowTransit'

/* This is a megacomponent. Don't worry, it'll stay like this until the UX
 * decisions are stabilized. We don't have many users yet */

export default function Transit({ itinerary, searchParams }) {
	const date = itinerary.date

	return (
		<TransitWrapper>
			<DateSelector date={date} planification={searchParams.planification} />
			<TransitOptions searchParams={searchParams} />
			<TransitContent {...{ itinerary, searchParams, date }} />
		</TransitWrapper>
	)
}

const TransitWrapper = styled.div`
	margin-top: 0.4rem;
	ul {
		list-style-type: none;
	}
	input {
		margin: 0 0 0 auto;
		display: block;
	}
`

const TransitContent = ({ itinerary, searchParams, date }) => {
	const data = itinerary.routes.transit
	console.log('cyan transit data', data)
	if (!data) return
	if (data.state === 'loading') return <TransitLoader text={data.message} />

	if (data.state === 'error')
		return <NoTransit reason={data.reason} solution={data.solution} />

	const connections = data?.itineraries
	// from now on, itineraries are called connections, Motis v1's term. Not to be
	// mixed up with our "itinerary" prop
	if (!connections || !connections.length) return <TransitScopeLimit />

	const nextConnections = filterNextConnections(connections, date)

	console.log('lightpurple transit', connections, nextConnections)
	if (nextConnections.length < 1) return <NoMoreTransitToday date={date} />

	const firstDate = nextConnections[0].startTime // We assume Motis orders them by start date, when you start to walk. Could also be intersting to query the first end date

	const bestConnection = findBestConnection(nextConnections)

	const firstStop = Math.min(
			...nextConnections.map((connection) => stamp(connection.startTime))
		),
		lastStop = Math.max(
			...nextConnections.map((connection) => stamp(connection.endTime))
		)

	const chosen = searchParams.details === 'oui' && searchParams.choix
	return (
		<section>
			<div>
				<LateWarning firstDate={firstDate} date={data.date} />
			</div>
			{!chosen ? (
				<section>
					<SlowTransit data={data} itineraryDistance={itinerary.distance} />

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
						credits={data.credits}
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
	max-height: 30rem;
`
const TransitTimeline = ({
	connections,
	date,
	connectionsTimeRange,
	selectedConnection,
	choix,
	credits,
}) => {
	const setSearchParams = useSetSearchParams()

	/* The request result's latest arrival date, usually too far, makes everything
	 * small
	 */
	const endTime = Math.max(
		...connections.map((connection) => stamp(connection.endTime))
	)

	const quickestConnection = connections.reduce(
			(memo, next) => (next.duration < memo.duration ? next : memo),
			{ duration: Infinity }
		),
		quickest = quickestConnection.duration

	const range = connectionsTimeRange.to - connectionsTimeRange.from

	/*
	 * quickest ->  60 % width
	 * range -> total %
	 * */
	return (
		<section>
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
							relativeWidth={
								0.6 // by construction, I think it's at least 0.6, so safe for <Line/>
							}
						/>
					))}
				</ul>
			</TransitTimelineWrapper>
			<Credits credits={credits} />
		</section>
	)
}

const Credits = ({ credits }) => {
	if (!credits) return
	return (
		<div>
			<small
				style={{
					fontSize: '65%',
					color: 'gray',
					textAlign: 'right',
					width: '100%',
					paddingRight: '1rem',
				}}
			>
				Sources : {credits}
			</small>
		</div>
	)
}

const correspondance = { WALK: 'Marche', Transport: 'Transport' }

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
	relativeWidth,
}) => {
	return (
		<ConnectionLi
			$selected={selected}
			onClick={() => setSelectedConnection(index)}
		>
			<Line
				relativeWidth={relativeWidth}
				connectionsTimeRange={connectionsTimeRange}
				transports={connection.legs}
				connection={connection}
				connectionRange={[
					console.log(
						'stamp',
						connection.startTime,
						stamp(connection.startTime)
					) || stamp(connection.startTime),
					stamp(connection.endTime),
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
		p.$mode === 'WALK' &&
		css`
			border-bottom: 4px dotted #5c0ba0;
		`}
`
// The code in this component is a mess. We're handling Motis's transport types
// + our own through brouter and valhalla. A refactoring should be done at some
// point
export const TimelineTransportBlock = ({ transport }) => {
	const [constraint, setConstraint] = useState('none')
	const background = transport.routeColor
		? handleColor(transport.routeColor)
		: '#d3b2ee'

	console.log('lightgreen TimelineTransportBlock', transport, background)
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
			$background={background || 'transparent'}
			$constraint={constraint}
			$displayImage={displayImage}
			$mode={transport.mode}
			ref={ref}
			title={`${humanDuration(transport.duration).single} de ${
				transport.frenchTrainType ||
				transport.shortName ||
				(transport.mode === 'CAR'
					? 'voiture'
					: transport.mode === 'BIKE'
					? 'vélo'
					: transport.mode === 'WALK'
					? 'marche'
					: transport.mode === 'PAUSE'
					? 'correspondance'
					: transport.mode)
			} ${transport.routeLongName || ''}`}
		>
			{transport.shortName ? (
				<TransportMoveBlock transport={transport} />
			) : transport.mode === 'CAR' ? (
				<MoveBlockImage
					src={'/car.svg'}
					alt="Icône d'une voiture"
					width="100"
					height="100"
					$transport="driving"
				/>
			) : transport.mode === 'BIKE' ? (
				<MoveBlockImage
					src={'/cycling.svg'}
					alt="Icône d'un vélo"
					width="100"
					height="100"
					$transport="cycling"
				/>
			) : transport.mode === 'WALK' ? (
				<MoveBlockImage
					src={'/walking.svg'}
					alt="Icône d'une personne qui marche"
					width="100"
					height="100"
					$transport="walking"
				/>
			) : transport.mode === 'PAUSE' ? (
				<MoveBlockImage
					src={'/sablier.svg'}
					alt="Icône d'un sablier pour symboliser l'attente d'un transport en commun"
					width="100"
					height="100"
					$transport="pause"
				/>
			) : (
				'UNDEFINED LEG MODE'
			)}
		</TimelineTransportBlockWrapper>
	)
}

const MoveBlockImage = styled(Image)`
	${(p) =>
		p.$transport === 'cycling'
			? css`
					height: 1.6rem !important;
					margin: -0.1rem 0 0 0 !important;
					filter: invert(1);
			  `
			: p.$transport === 'walking'
			? css`
					height: 1.4rem !important;
					margin: -0.1rem 0 0 0 !important;
			  `
			: p.$transport === 'pause'
			? css`
					height: 1rem !important;
					margin: 0.12rem 0 0 0 !important;
					opacity: 0.7;
			  `
			: css`
					height: 1.4rem !important;
					margin: 0 !important;
			  `}
`
