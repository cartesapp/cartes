import useMeasureDistance from '@/app/useMeasureDistance'
import useSetSearchParams from '@/components/useSetSearchParams'
import { omit } from '@/components/utils/utils'
import { css, styled } from 'next-yak'
import Link from 'next/link'
import ItineraryButton, { ResetIcon } from './itinerary/ItineraryButton'
import { Style } from 'maplibre-gl'

const ResetDistanceButton = styled.button`
	position: absolute;
	bottom: -0.5rem;
	right: -1.7rem;
`
export const mapButtonSize = '2.15rem'
export const MapButtonsWrapper = styled.div`
	position: fixed;
	top: 13rem;
	right: 0.6rem;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: end;
`
export const MapButton = styled.div`
	margin-bottom: 0.4rem;
	width: ${mapButtonSize};
	height: ${mapButtonSize};
	text-align: center;
	border-radius: 4px;
	box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
	padding: 0.1rem;
	img {
		width: 1.5rem;
		height: auto;
		vertical-align: bottom;
	}
	background: #ffffff;
	border: 0px solid lightgrey;
	cursor: pointer;
	${(p) =>
		p.$active &&
		css`
			border: 3px solid var(--color);
			width: 4rem;
			height: 4rem;
		`}
	position: relative;
	> button:first-child {
		width: 100%;
		height: 100%;
		padding: 0;
		margin: 0;
	}
	a {
		width: 100%;
		height: 100%;
		text-decoration: none;
		color: inherit;
		display: flex;
		align-items: center;
		justify-content: center;
	}
`

export default function MapButtons({
	styleChooser,
	setStyleChooser,
	style,
	setDistanceMode,
	distanceMode,
	map,
	itinerary,
	searchParams,
}) {
	const [distance, resetDistance] = useMeasureDistance(map, distanceMode)
	const setSearchParams = useSetSearchParams()

	return (
		<MapButtonsWrapper>
			{false && ( // keeping this, not sure we won't introduce this button back. For now, it's in the style chooser
				<MapButton $active={searchParams.transports === 'oui'}>
					<Link
						title={'Voir la carte des transports en commun'}
						href={'#coderemoved'}
					>
						<img
							src={'/transports.svg'}
							css={css`
								filter: none !important;
							`}
						/>
					</Link>
				</MapButton>
			)}
			{false && (
				<MapButton
					$active={searchParams.style === 'elections'}
					css={css`
						border: 2px solid purple;
					`}
				>
					<button
						onClick={() =>
							setSearchParams({
								style:
									searchParams.style === 'elections' ? undefined : 'elections',
							})
						}
						title={'Montrer les circonscriptions législatives 2024'}
					>
						🗳️
					</button>
				</MapButton>
			)}
			<MapButton $active={styleChooser}>
				<button
					onClick={() => setStyleChooser(!styleChooser)}
					title={'Choisir un autre style de fond de carte'}
				>
					<StyleChooserIcon />
				</button>
			</MapButton>
			<MapButton $active={distanceMode}>
				<button
					onClick={() => setDistanceMode(!distanceMode)}
					title="Mesurer une distance"
				>
					<div>
						<DistanceIcon />
					</div>
					{distanceMode ? <small>{distance}</small> : null}
				</button>
				{distanceMode && (
					<ResetDistanceButton onClick={() => resetDistance()}>
						<ResetIcon />
					</ResetDistanceButton>
				)}
			</MapButton>
			<ItineraryButton {...itinerary} />
			<MapButton $active={searchParams.favoris === 'oui'}>
				<Link
					title="Gérer mes favoris"
					href={setSearchParams(
						{
							...omit(['favoris'], searchParams),
							...(searchParams.favoris ? {} : { favoris: 'oui' }),
						},
						true,
						true
					)}
				>
					<img
						src={'/star.svg'}
						style={{
							filter: 'none',
						}}
					/>
				</Link>
			</MapButton>
		</MapButtonsWrapper>
	)
}
export const StyleChooserIcon = () => (
	<img
		css={css`
			width: 1.4rem;
			height: 1.4rem;
			margin: 0 !important;
		`}
		src={'/map.svg'}
		width="100"
		height="100"
		alt="Icône fond de carte"
	/>
)
export const DistanceIcon = () => (
	<img
		css={css`
			width: 1.4rem;
			height: 1.4rem;
			margin: 0 !important;
		`}
		src={'/distance.svg'}
		width="100"
		height="100"
		alt="Icône distance"
	/>
)
