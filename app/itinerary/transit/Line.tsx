import useSetSearchParams from '@/components/useSetSearchParams'
import { css, styled } from 'next-yak'
import { useRef } from 'react'
import { TimelineTransportBlock } from './Transit'
import DetailsButton from '@/components/transit/DetailsButton'
import { formatMotis, humanDuration } from './utils'

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
			css={css`
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
			<SizedLine ref={animatedScrollRef} $barWidth={barWidth} $left={left}>
				<ul
					css={css`
						display: flex;
						justify-content: space-evenly;
						list-style-type: none;
						align-items: center;
						width: 100%;
					`}
				>
					{transports.map((transport) => (
						<li
							key={
								transport.shortName || transport.move_type + transport.seconds
							}
							style={{
								width: (transport.seconds / connection.seconds) * 100 + '%',
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
						<div
							css={css`
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
								link={setSearchParams(
									{ choix: choix || 0, details: 'oui' },
									true
								)}
							/>
						</div>
					)}
				<div
					css={css`
						margin-top: 0.1rem;
						display: flex;
						justify-content: space-between;
						line-height: 1.2rem;
					`}
				>
					<small>{formatMotis(from)}</small>
					<small
						css={css`
							color: #555;
						`}
					>
						{to - from > 25 * 60 // 10 minutes TODO this should be calculated : does it fit ?? show '-' and title=
							? humanDuration(connection.seconds).single
							: ' - '}
					</small>
					<small>{formatMotis(to)}</small>
				</div>
			</SizedLine>
		</div>
	)
}

const SizedLine = styled.div`
	position: absolute;
	left: calc(0.6rem + ${(p) => p.$left}%);
	width: calc(${(p) => p.$barWidth}% - 1rem);
	top: 50%;
	transform: translateY(-50%);
`
