import noTransports from '@/public/no-transports.svg'
import { styled } from 'next-yak'
import Image from 'next/image'
import DateSelector from '../DateSelector'

const MessageBlockWrapper = styled.section`
	margin-top: 2rem;
	line-height: 1.3rem;
	display: flex;
	align-items: center;
	img {
		width: 2rem;
		height: auto;
		margin-right: 0.8rem;
		margin-left: 0.4rem;
	}
`

const MessageBlock = ({ message, solution }) => (
	<MessageBlockWrapper>
		<Image
			src={noTransports}
			alt="Icône d'erreur du calcul de transport en commun"
		/>
		<div>
			<p style={{ fontSize: '90%' }}>{message}</p>
			{solution && <SolutionButton>{solution}</SolutionButton>}
		</div>
	</MessageBlockWrapper>
)
const SolutionButton = styled.button`
	background: var(--lightestColor);
	padding: 0.2rem 0.4rem;
`

export const NoTransit = ({ reason, solution }) => {
	if (reason) return <MessageBlock message={reason} solution={solution} />
	if (!reason)
		return <MessageBlock message={'Pas de transport en commun trouvé :('} />
}

export const TransitScopeLimit = () => (
	<MessageBlock
		message={`
			💡 Les transports en commun ne sont complets qu'en Bretagne et Pays de la
			Loire pour l'instant. Car le développeur est breton et qu'il faut bien
			commencer quelque part :)`}
	/>
)
export const NoMoreTransitToday = ({ date }) => (
	<section>
		<p>🫣 Pas de transport en commun à cette heure-ci</p>
		<DateSelector date={date} />
	</section>
)
