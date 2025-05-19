import { ModalCloseButton } from '@/app/UI'
import TransportMoveBlock from '@/app/itinerary/transit/TransportMoveBlock'
import { formatMotis, humanDuration } from '@/app/itinerary/transit/utils'
import Image from 'next/image'
import useSetSearchParams from '../useSetSearchParams'
import {
	Approach,
	Arrival,
	StationWrapper,
	Transport,
	Transports,
	Wrapper,
} from './TransitInstructionsUI'
import { notTransitType } from '@/app/itinerary/transit/motisRequest'

export default function TransitInstructions({ connection }) {
	const setSearchParams = useSetSearchParams()
	console.log('lightpurple', connection)
	if (connection.transports.length < 3) return
	const { transports, stops } = connection

	const firstTransitStopIndex = transports[1].trip.range.from,
		firstTransitStop = stops[firstTransitStopIndex]

	const start = modeToFrench[transports[0].mode]
	const end = modeToFrench[transports[transports.length - 1].mode]
	return (
		<Wrapper>
			<ModalCloseButton
				onClick={() => {
					setSearchParams({ details: undefined })
				}}
			/>
			<h2>Feuille de route</h2>
			<Approach>
				<Image
					src={'/' + start.icon + '.svg'}
					width="10"
					height="10"
					alt={
						"Icône de l'approche vers le premier arrêt de transport en commun"
					}
				/>{' '}
				{start.present}{' '}
				<span>
					{humanDuration(transports[0].duration).single.toLowerCase()}
				</span>{' '}
				jusqu'à l'arrêt {firstTransitStop.station.name}
			</Approach>
			<Transports>
				<ol>
					{connection.transports
						.filter((transport) => !notTransitType.includes(transport.mode))
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
								<Transport key={transport.route_id} $transport={transport}>
									<TransportMoveBlock transport={transport} />
									<Station
										{...{
											transport,
											stop: transportStops[0],
										}}
									/>
									{halts && (
										<details>
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
												style={{
													marginBottom: '1.6rem',
												}}
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
								</Transport>
							)
						})}
				</ol>
			</Transports>
			<Arrival>
				<Image
					src={'/' + end.icon + '.svg'}
					width="10"
					height="10"
					alt={'Icône de la fin du trajet'}
				/>{' '}
				{end.present}{' '}
				<span>
					{humanDuration(
						transports[transports.length - 1].duration
					).single.toLowerCase()}
				</span>{' '}
				jusqu'à votre destination.
			</Arrival>
		</Wrapper>
	)
}
const Station = ({ transport, stop, baseTime = null, last = false }) => {
	return (
		<StationWrapper $last={last}>
			<span>
				<StationDisc color={transport.route_color} last={last} />{' '}
				<small>{stop.station.name}</small>
			</span>
			<small>
				{baseTime ? (
					humanDuration(stop.arrival.time - baseTime).single
				) : (
					<span
						style={{
							color: 'gray',
							marginLeft: '0.4rem',
						}}
					>
						{formatMotis(stop.departure?.time || stop.arrival?.time)}
					</span>
				)}
			</small>
		</StationWrapper>
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

const modeToFrench = {
	WALK: { present: 'Marchez', future: 'marcherez', icon: 'walking' },
	BIKE: { present: 'Roulez', future: 'roulerez', icon: 'cycling.svg' },
	CAR: { present: 'Roulez', future: 'roulerez', icon: 'car.svg' },
}
