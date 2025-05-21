import { ModalCloseButton } from '@/app/UI'
import TransportMoveBlock from '@/app/itinerary/transit/TransportMoveBlock'
import {
	formatIsoDate,
	formatMotis,
	humanDuration,
} from '@/app/itinerary/transit/utils'
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
	const { legs } = connection
	if (legs.length < 3) return
	//TODO this condition was probably put here because we don't handle when there
	//is no pre-transit + transit + post-transit legs
	//In some cases, there won't be any walk necessary for instance.

	const firstTransitStop = legs[0].to

	const start = modeToFrench[legs[0].mode]
	const end = modeToFrench[legs[legs.length - 1].mode]
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
				<span>{humanDuration(legs[0].duration).single.toLowerCase()}</span>{' '}
				jusqu'à l'arrêt {firstTransitStop.name}
			</Approach>
			<Transports>
				<ol>
					{connection.legs
						.filter((leg) => !notTransitType.includes(leg.mode))
						.map((leg) => {
							const {
								intermediateTrops: halts,
								trip: {
									range: { from, to },
								},
							} = leg

							return (
								<Transport key={leg.tripId} $transport={leg}>
									<TransportMoveBlock transport={leg} />
									<Station
										{...{
											leg,
											stop: leg.from,
										}}
									/>
									{halts?.length > 0 && (
										<details>
											<summary>
												{halts.length} arrêts,{' '}
												<span>{humanDuration(leg.duration).single}</span>
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
																leg,
																stop,
															}}
														/>
													</li>
												))}
											</ol>
										</details>
									)}
									<Station
										{...{
											leg,
											stop: leg.to,
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
					{humanDuration(legs[legs.length - 1].duration).single.toLowerCase()}
				</span>{' '}
				jusqu'à votre destination.
			</Arrival>
		</Wrapper>
	)
}
const Station = ({ leg, stop, last = false }) => {
	return (
		<StationWrapper $last={last}>
			<span>
				<StationDisc color={leg.routeColor} last={last} />{' '}
				<small>{stop.name}</small>
			</span>
			<small>
				<span
					style={{
						color: 'gray',
						marginLeft: '0.4rem',
					}}
				>
					{formatIsoDate(stop.scheduledDeparture || stop.scheduledArrival)}
				</span>
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
