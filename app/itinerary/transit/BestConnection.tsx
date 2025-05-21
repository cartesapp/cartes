import { styled } from 'next-yak'
import Image from 'next/image'
import { TimelineTransportBlock } from './Transit'
import {
	findConnectionTransit,
	nextDeparturesSentence,
} from './findBestConnection'

import { routeTypeName } from '@/components/transit/modeCorrespondance'

export default function BestConnection({ bestConnection }) {
	console.log('prune best', bestConnection)
	const leg = findConnectionTransit(bestConnection.best)
	const stop = leg.from.name

	const transportType = routeTypeName(leg.route_type)
	return (
		<Wrapper>
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
					<span>
						<TimelineTransportBlock transport={leg} />
					</span>
					passe {bestConnection.interval} à l'arrêt{' '}
					<em
						style={{
							whiteSpace: 'nowrap',
						}}
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
		</Wrapper>
	)
}

const Wrapper = styled.section`
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
	> div > p > span {
		display: inline-block;
		width: 4rem;
		margin: 0 0.4rem;
	}
`
