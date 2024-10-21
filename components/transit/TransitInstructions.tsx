import { ModalCloseButton } from '@/app/UI'
import useSetSearchParams from '../useSetSearchParams'
import Image from 'next/image'
import { formatMotis, humanDuration } from '@/app/itinerary/transit/utils'
import TransportMoveBlock from '@/app/itinerary/transit/TransportMoveBlock'

export default function TransitInstructions({ connection }) {
	const setSearchParams = useSetSearchParams()
	console.log('lightpurple', connection)
	if (connection.transports.length < 3) return
	const { transports, stops } = connection

	const firstTransitStopIndex = transports[1].trip.range.from,
		firstTransitStop = stops[firstTransitStopIndex]

	const start = moveTypeToFrench[transports[0].move_type]
	const end = moveTypeToFrench[transports[transports.length - 1].move_type]
	return (
		<div
			css={`
				position: relative;
				h2 {
					font-weight: 600;
					margin-bottom: 0.4rem;
				}
			`}
		>
			<ModalCloseButton
				onClick={() => {
					setSearchParams({ details: undefined })
				}}
			/>
			<h2>Feuille de route</h2>
			<section
				css={`
					> img {
						width: 1.4rem;
						height: auto;
						vertical-align: sub;
					}
				`}
			>
				<Image
					src={'/' + start.icon + '.svg'}
					width="10"
					height="10"
					alt={
						"Icône de l'approche vers le premier arrêt de transport en commun"
					}
				/>{' '}
				{start.verb}{' '}
				<span>{humanDuration(transports[0].seconds).single.toLowerCase()}</span>{' '}
				jusqu'à l'arrêt {firstTransitStop.station.name}
			</section>
			<section
				css={`
					margin: 0.6rem 0.4rem;
					ol {
						list-style-type: none;
					}
				`}
			>
				<ol>
					{connection.transports
						.filter(({ move_type }) => move_type === 'Transport')
						.map((transport) => {
							const {
								trip: {
									range: { from, to },
								},
							} = transport
							const transportStops = stops.slice(from, to + 1)

							console.log('lightpurple halts', from, to, transportStops, stops)

							const halts =
								transportStops.length > 2 && transportStops.slice(1, -1)
							return (
								<li
									key={transport.route_id}
									css={`
										border-left: 4px solid ${transport.route_color};
										> span {
											border-top-right-radius: 0.3rem;
											border-bottom-right-radius: 0.3rem;
											padding: 0.1rem 0.4rem;
											margin-bottom: 0.4rem;
											img {
												height: 1rem;
											}
										}
										margin-bottom: 1.6rem;
										padding-bottom: 1.2rem;
										position: relative;
									`}
								>
									<TransportMoveBlock transport={transport} />
									<Station
										{...{
											transport,
											stop: transportStops[0],
										}}
									/>
									{halts && (
										<details
											css={`
												summary {
													padding-left: 0.5rem;
													color: var(--darkColor);
													list-style-type: none;
												}
											`}
										>
											<summary>
												{halts.length} arrêts,{' '}
												<span>
													{
														humanDuration(
															transportStops.slice(-1)[0].arrival.time -
																transportStops[0].departure.time
														).single
													}
												</span>
											</summary>
											<ol
												css={`
													margin-bottom: 1.6rem;
												`}
											>
												{halts.map((stop, index) => (
													<li key={stop.station.id}>
														<Station
															{...{
																transport,
																stop,
																firstStop: transportStops[0].departure.time,
															}}
														/>
													</li>
												))}
											</ol>
										</details>
									)}
									<Station
										{...{
											transport,
											stop: transportStops[transportStops.length - 1],
											last: true,
										}}
									/>
								</li>
							)
						})}
				</ol>
			</section>
			<section
				css={`
					> img {
						width: 1.4rem;
						height: auto;
						vertical-align: sub;
					}
				`}
			>
				<Image
					src={'/' + end.icon + '.svg'}
					width="10"
					height="10"
					alt={'Icône de la fin du trajet'}
				/>{' '}
				{end.verb}{' '}
				<span>
					{humanDuration(
						transports[transports.length - 1].seconds
					).single.toLowerCase()}
				</span>{' '}
				jusqu'à votre destination.
			</section>
		</div>
	)
}
const Station = ({ transport, stop, baseTime = null, last = false }) => {
	return (
		<section
			css={`
				margin: 0.6rem 0 0.6rem -0.5rem;
				display: flex;
				align-items: center;
				svg {
					margin-bottom: -0.05rem;
				}
				> span {
					display: flex;
					align-items: center;
					gap: 0.4rem;
					line-height: 0.85rem;
				}
				> small {
					color: gray;
				}
				width: 16rem;
				justify-content: space-between;
				${last && `position: absolute; bottom: -.8rem; left: 0`}
			`}
		>
			<span>
				<StationDisc color={transport.route_color} last={last} />{' '}
				<small>{stop.station.name}</small>
			</span>
			<small>
				{baseTime ? (
					humanDuration(stop.arrival.time - baseTime).single
				) : (
					<span
						css={`
							color: gray;
							margin-left: 0.4rem;
						`}
					>
						{formatMotis(stop.departure?.time || stop.arrival?.time)}
					</span>
				)}
			</small>
		</section>
	)
}

const StationDisc = ({ color, last }) => (
	<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width=".8rem">
		<circle
			cx="50"
			cy="50"
			r={last ? '40' : '30'}
			fill={last ? color : 'white'}
			stroke={last ? 'white' : color}
			stroke-width={last ? '12' : '18'}
		/>
	</svg>
)

const moveTypeToFrench = {
	Walk: { verb: 'Marchez', icon: 'walking' },
	Bike: { verb: 'Roulez', icon: 'cycling.svg' },
	Car: { verb: 'Roulez', icon: 'car.svg' },
}
