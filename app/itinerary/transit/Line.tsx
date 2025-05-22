import DetailsButton from '@/components/transit/DetailsButton'
import useSetSearchParams from '@/components/useSetSearchParams'
import { styled } from 'next-yak'
import { useRef } from 'react'
import { TimelineTransportBlock } from './Transit'
import { formatMotis, humanDuration, stamp } from './utils'

export const Line = ({
	connectionsTimeRange,
	connection,
	connectionRange: [from, to],
	transports,
	choix,
	index,
	componentMode,
	relativeWidth = 0,
}) => {
	const setSearchParams = useSetSearchParams()

	const { from: absoluteFrom, to: absoluteTo } = connectionsTimeRange
	const length = absoluteTo - absoluteFrom

	const barWidth = ((to - from) / length) * 100,
		left = ((from - absoluteFrom) / length) * 100

	const animatedScrollRef = useRef()

	const transportsWithPauses = transports
		.map((transport, index) => {
			if (!index) return transport
			const pause =
					stamp(transport.scheduledStartTime) -
					stamp(transports[index - 1].scheduledEndTime),
				hasSignificantPause = pause > 5 * 60

			if (hasSignificantPause)
				return [
					{
						duration: pause,
						mode: 'PAUSE',
						routeColor: '#c6c9f5', // not convinced by this color, but coding quick this new feature
						endTime: transport.endTime,
					},
					transport,
				]
			return transport
		})
		.flat()

	console.log('lightgreen line', transports, from, to, transportsWithPauses)

	return (
		<Wrapper
			onClick={() =>
				animatedScrollRef.current.scrollIntoView({
					behavior: 'smooth',
					inline: 'start',
					block: 'center',
				})
			}
		>
			<SizedLine ref={animatedScrollRef} $barWidth={barWidth} $left={left}>
				<ul>
					{transportsWithPauses.map((transport, index) => (
						<li
							key={
								transport.tripId ||
								transport.shortName ||
								transport.mode + transport.endTime
							}
							style={{
								width: (transport.duration / connection.duration) * 100 + '%',
								height: '1.8rem',
								borderRight: '2px solid white',
							}}
						>
							<TimelineTransportBlock transport={transport} />
						</li>
					))}
				</ul>

				{componentMode === 'transit' &&
					((!choix && index === 0) || choix == index) && (
						<DetailsButtonWrapper>
							<DetailsButton
								link={setSearchParams(
									{ choix: choix || 0, details: 'oui' },
									true
								)}
							/>
						</DetailsButtonWrapper>
					)}
				<Duration>
					<small title={from}>{formatMotis(from)}</small>
					<small
						style={{
							color: '#555',
						}}
					>
						{relativeWidth > 0.5
							? humanDuration(connection.duration).single
							: ' - '}
					</small>
					<small title={to}>{formatMotis(to)}</small>
				</Duration>
			</SizedLine>
		</Wrapper>
	)
}

const Duration = styled.div`
	margin-top: 0.1rem;
	display: flex;
	justify-content: space-between;
	line-height: 1.2rem;
`
const DetailsButtonWrapper = styled.div`
	position: absolute;
	right: -3rem;
	top: 50%;
	transform: translateY(-50%);
	font-size: 200%;
	a {
		text-decoration: none;
	}
`

const Wrapper = styled.div`
	height: 4rem;
	width: calc(100% - 1rem);
	padding: 0.4rem 0;
	margin: 0;
	margin-top: 0.3rem;
	position: relative;
	display: flex;
	align-items: center;
	background: white;
`
const SizedLine = styled.div`
	position: absolute;
	left: calc(0.6rem + ${(p) => p.$left}%);
	width: calc(${(p) => p.$barWidth}% - 1rem);
	top: 50%;
	transform: translateY(-50%);
	ul {
		display: flex;
		justify-content: space-evenly;
		list-style-type: none;
		align-items: center;
		width: 100%;
	}
`
