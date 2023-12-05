'use client'

import useMeasureDistance from '@/app/voyage/useMeasureDistance'
import Link from 'next/link'
import styled from 'styled-components'
import Emoji from '../Emoji'
import useSetSeachParams from '../useSetSearchParams'

export const MapButtonsWrapper = styled.div`
	position: fixed;
	top: 9rem;
	right: 0.6rem;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: end;
`
export const MapButton = styled.div`
	margin-bottom: 0.4rem;
	width: 1.9rem;
	height: auto;
	text-align: center;
	border-radius: 4px;
	box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
	padding: 0.1rem;
	background: white;
	opacity: 0.8;
	img {
		width: 1.5rem;
		height: auto;
	}
	border: 0px solid lightgrey;
	cursor: pointer;
	${(p) =>
		p.$active &&
		`

	border: 2px solid var(--color);
	width: 4rem;


	`}
	position: relative;
	> button:first-child {
		width: 100%;
		height: 100%;
		padding: 0;
		margin: 0;
	}
	a {
		text-decoration: none;
		color: inherit;
	}
`

export default function MapButtons({
	style,
	setDistanceMode,
	map,
	distanceMode,
}) {
	const setSearchParams = useSetSeachParams()
	const [distance, resetDistance] = useMeasureDistance(map, distanceMode)
	return (
		<MapButtonsWrapper>
			<MapButton>
				<Link
					href={setSearchParams(
						{ style: style === 'satellite' ? 'streets' : 'satellite' },
						true,
						false
					)}
					title={
						{
							satellite: 'Passer à la vue carto',
							streets: 'Passer à la vue satellite',
						}[style]
					}
				>
					<Emoji e={{ satellite: '🗺️', streets: '🛰️' }[style]} />
				</Link>
			</MapButton>
			<MapButton $active={distanceMode}>
				<button onClick={() => setDistanceMode(!distanceMode)}>
					<div>
						<Emoji e="📐" />
					</div>
					{distanceMode ? <small>{distance}</small> : null}
				</button>
				{distanceMode && (
					<button
						onClick={() => resetDistance()}
						css={`
							position: absolute;
							bottom: -1rem;
							right: -1.9rem;
							img {
								width: 1.8rem;
								height: 1.8rem;
							}
						`}
					>
						<Emoji e="🚮" />
					</button>
				)}
			</MapButton>
		</MapButtonsWrapper>
	)
}