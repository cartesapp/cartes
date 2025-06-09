import CircularIcon from '@/components/CircularIcon'
import useSetSearchParams from '@/components/useSetSearchParams'
import { styled } from 'next-yak'
import Link from 'next/link'
import { useEffect } from 'react'
import { ContentSection } from '../ContentUI'
import RouteRésumé, { computeHumanDistance } from '../RouteRésumé'
import { ModalCloseButton } from '../UI'
import ClickItineraryInstruction from './ClickItineraryInstruction'
import Steps from './Steps'
import Timeline from './Timeline'
import Transit from './transit/Transit'
import { useMemoPointsFromState } from './useDrawItinerary'

export const modes = [
	['cycling', { label: 'Vélo', query: 'velo' }],
	['transit', { label: 'Transports', query: 'commun' }],
	['walking', { label: 'Marche', query: 'marche' }],
	['car', { label: 'Voiture', query: 'voiture' }],
]

export const modeKeyFromQuery = (myQuery) =>
	(modes.find(([, { query }]) => query === myQuery) || [])[0]

export default function Itinerary({
	itinerary,
	searchParams,
	close,
	state,
	setState,
	setSnap,
	setDisableDrag,
}) {
	const { bikeRouteProfile, setBikeRouteProfile } = itinerary
	const setSearchParams = useSetSearchParams()

	const mode = modeKeyFromQuery(searchParams.mode)

	useEffect(() => {
		if (!itinerary.isItineraryMode) return
		setSnap(1, 'Itinerary')
	}, [setSnap, itinerary.isItineraryMode])

	const [serializedPoints, points, itineraryDistance] =
		useMemoPointsFromState(state)

	if (!itinerary.isItineraryMode) return null

	return (
		<Wrapper>
			<h1>
				Itinéraire{' '}
				{points.length > 1 && (
					<small style={{ fontSize: '60%' }}>
						de {computeHumanDistance(itineraryDistance * 1000)}
					</small>
				)}
			</h1>
			<ModalCloseButton title="Fermer l'encart itinéraire" onClick={close} />
			<Steps
				{...{
					state,
					setDisableDrag,
					setState,
				}}
			/>
			{!itinerary.routes ? (
				<ClickItineraryInstruction state={state} />
			) : (
				<div>
					<ModeTabs>
						{[
							[
								undefined,
								{
									label: 'résumé',
									icon: 'frise',
									description: "Toutes les options en un clin d'œil",
								},
							],
							...modes,
						].map(([key, { label, icon, description, query }]) => (
							<li key={key || 'undefined'}>
								<Link
									href={setSearchParams(
										{ mode: mode === key ? undefined : query },
										true
									)}
									title={description || label}
								>
									<CircularIcon
										src={`/${key || icon}.svg`}
										alt={'Icône représentant le mode ' + label}
										background={
											mode !== key ? 'var(--lighterColor)' : 'var(--color)'
										}
									/>
								</Link>
							</li>
						))}
					</ModeTabs>
					{mode === undefined && <Timeline itinerary={itinerary} />}
					{['cycling', 'walking', 'car'].includes(mode) && (
						<RouteRésumé
							{...{
								mode,
								data: itinerary.routes[mode],
								bikeRouteProfile,
								setBikeRouteProfile,
								setItineraryPosition: (itiPosition: number) =>
									setSearchParams({ itiPosition }),
								itineraryPosition: searchParams.itiPosition
									? +searchParams.itiPosition
									: undefined,
							}}
						/>
					)}
					{mode === 'transit' && (
						<Transit itinerary={itinerary} searchParams={searchParams} />
					)}
				</div>
			)}
		</Wrapper>
	)
}

const Wrapper = styled(ContentSection)`
	margin-bottom: 1rem;
`

const ModeTabs = styled.ol`
	margin-top: 0.1rem;
	margin-left: 0;
	padding-left: 0;
	list-style-type: none;
	display: flex;
	align-items: center;
	justify-content: start;
	gap: 1rem;
	width: 80%;
	li {
		margin: 0 0.4rem;
	}
`
