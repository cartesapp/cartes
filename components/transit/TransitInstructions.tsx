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
	NoTransitLeg,
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
	if (!legs.length) return

	return (
		<Wrapper>
			<ModalCloseButton
				onClick={() => {
					setSearchParams({ details: undefined })
				}}
			/>
			<h2>Feuille de route</h2>
			<Transports>
				<ol>
					{connection.legs.map((leg, index) => {
						if (notTransitType.includes(leg.mode)) {
							const { icon, present } = modeToFrench[leg.mode]
							return (
								<NoTransitLeg key={leg.mode + leg.startTime}>
									<Image
										src={'/' + icon + '.svg'}
										width="10"
										height="10"
										alt={`Icône du transfert ${
											index === 0
												? 'vers le premier arrêt de transport en commun'
												: index === legs.length - 1
												? 'de la fin du trajet'
												: `d'un arrêt de transport à l'autre`
										}.`}
									/>{' '}
									{present}{' '}
									{index === 0 ? (
										<>
											<span>
												<span>{formatDuration(leg.duration)}</span>
											</span>{' '}
											jusqu'à l'arrêt {leg.to.name}
										</>
									) : index === legs.length - 1 ? (
										<>
											<span>{formatDuration(leg.duration)}</span> jusqu'à votre
											destination.
										</>
									) : (
										<>
											<span>
												<span>{formatDuration(leg.duration)}</span>
											</span>{' '}
										</>
									)}
								</NoTransitLeg>
							)
						}

						const { intermediateTrops: halts } = leg
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
		</Wrapper>
	)
}
const formatDuration = (duration) =>
	duration < 15
		? '⚡️ en un éclair'
		: humanDuration(duration).single.toLowerCase()
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

export const modeToFrench = {
	WALK: { present: 'Marchez', future: 'marcherez', icon: 'walking' },
	BIKE: { present: 'Roulez', future: 'roulerez', icon: 'cycling' },
	CAR: { present: 'Roulez', future: 'roulerez', icon: 'car' },
}
