 import carIcon from '@/public/car.svg'
 import Image from 'next/image'
 import { css } from 'next-yak'
 
 import { getTimePart } from '@/components/transit/modes'
 import { Button } from './UI'
 
 export default function StartEndOptions({
 	setSearchParams,
 	searchParams,
 	partKey,
 }) {
 	const which = searchParams[partKey]
 	const time = which && getTimePart(which)
 
 	return (
 		<Button
 			css={css`
 				flex-direction: row !important;
 				width: 6rem;
 			`}
 		>
 			<div
 				css={css`
 					position: absolute;
 					top: calc(50% - 1px);
 					width: 6rem;
 					background: linear-gradient(
 						90deg,
 						var(--lighterColor) 0%,
 						transparent 30%,
 						transparent 80%,
 						var(--color) 100%
 					);
 					height: 2px;
 				`}
 			/>
 
 			<button
 				css={css`
 					img {
 						height: 2rem !important;
 						width: auto !important;
 						filter: invert(46%) sepia(13%) saturate(5002%) hue-rotate(181deg)
 							brightness(92%) contrast(88%);
 					}
 				`}
 				onClick={() =>
 					setSearchParams({
 						[partKey]:
 							(which
 								? which.startsWith('marche-')
 									? 'vélo'
 									: which.startsWith('vélo')
 									? 'voiture'
 									: /* TODO activate this when we can draw precise walk trips, else we can't easily check that wheelchair routing works.
 									: which.startsWith('voiture')
 									? 'marchereduite'
 									*/
 									  'marche'
 								: 'marche') +
 							'-' +
 							(!which ? '5min' : getTimePart(which) + 'min'),
 					})
 				}
 			>
 				{which == null ? (
 					<Image
 						src={'/walk-or-cycle.svg'}
 						alt="Icône de quelqu'un qui marche ou roule à vélo"
 						width="10"
 						height="10"
 					/>
 				) : which.startsWith('marchereduite') ? (
 					<Image
 						src={'/wheelchair.svg'}
 						alt="Icône d'une personne en fauteuil roulant"
 						width="10"
 						height="10"
 					/>
 				) : which.startsWith('marche') ? (
 					<Image
 						src={'/walking.svg'}
 						alt="Icône de quelqu'un qui marche"
 						width="10"
 						height="10"
 					/>
 				) : which.startsWith('voiture') ? (
 					<Image src={carIcon} alt="Icône d'une voiture" />
 				) : which.startsWith('vélo') ? (
 					<Image
 						src={'/cycling.svg'}
 						alt="Icône d'un vélo"
 						width="10"
 						height="10"
 					/>
 				) : (
 					<span>quoi ?</span>
 				)}
 			</button>
 			<button
 				onClick={() =>
 					setSearchParams({
 						[partKey]:
 							(which ? which.split('-')[0] : 'marche') +
 							'-' +
 							(!time
 								? '5min'
 								: time == 5
 								? '15min'
 								: time == 15
 								? '30min'
 								: '5min'),
 					})
 				}
 				css={css`
 					border: 2px solid var(--color);
 					color: var(--color);
 					border-radius: 3rem;
 					width: 1.4rem;
 					height: 1.4rem;
 					text-align: center;
 					font-size: 75%;
 					position: relative;
 					> div {
 						position: absolute;
 						top: 50%;
 						left: 52%;
 						transform: translate(-50%, -50%);
 						line-height: 1.1rem;
 						div,
 						small {
 							line-height: 0.65rem;
 						}
 					}
 				`}
 			>
 				<span
 					css={css`
 						height: 4px;
 						width: 4px;
 						position: absolute;
 						top: -5px;
 						left: 42%;
 						background: var(--color);
 					`}
 				></span>
 				<div>
 					{time == null ? (
 						<span
 							css={css`
 								font-size: 70%;
 							`}
 						>
 							auto
 						</span>
 					) : (
 						<div>
 							<div>{time}'</div>
 						</div>
 					)}
 				</div>
 			</button>
 		</Button>
 	)
 }
