 import Image from 'next/image'
 import { TimelineTransportBlock } from './Transit'
 import { routeTypeName } from './transportIcon'
 import { capitalise0 } from '@/components/utils/utils'
 import { nextDeparturesSentence } from './findBestConnection'
 
 export default function BestConnection({ bestConnection }) {
 	console.log('prune best', bestConnection)
 	const transport = bestConnection.best.transports.find((t) => t.trip)
 	const stop = bestConnection.best.stops[transport.move.range.from].station.name
 
 	const transportType = routeTypeName(transport.route_type)
 	return (
 		<div
 			css={css`
 				background: white;
 				margin: 0.6rem 0;
 				border: 2px solid gold;
 				border-radius: 0.8rem;
 
 				padding: 0 0.4rem;
 				display: flex;
 				align-items: center;
 				> img {
 					margin: 1rem;
 					width: 1.8rem;
 					height: auto;
 				}
 				p {
 					line-height: 1.4rem;
 				}
 			`}
 		>
 			<Image
 				src="/star-full-gold.svg"
 				alt="Icône d'étoile couleur or pour le trajet optimal"
 				width="10"
 				height="10"
 			/>
 			<div>
 				<small>Il y a un {transportType} optimal !</small>
 				<p>
 					Le direct
 					<span
 						css={css`
 							display: inline-block;
 							width: 4rem;
 							margin: 0 0.4rem;
 						`}
 					>
 						<TimelineTransportBlock transport={transport} />
 					</span>
 					passe {bestConnection.interval} à l'arrêt{' '}
 					<em
 						css={css`
 							white-space: nowrap;
 						`}
 					>
 						{stop}
 					</em>
 					.
 				</p>
 				<p>
 					<small>
 						⌚️ Partir {nextDeparturesSentence(bestConnection.nextDepartures)}.
 					</small>
 				</p>
 			</div>
 		</div>
 	)
 }
