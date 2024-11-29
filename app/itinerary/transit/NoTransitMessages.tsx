 import {styled} from 'next-yak'
 import DateSelector from '../DateSelector'
 import noTransports from '@/public/no-transports.svg'
 import Image from 'next/image'
 
 const MessageBlock = ({ message, solution }) => (
 	<section
 		css={css`
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
 		`}
 	>
 		<Image
 			src={noTransports}
 			alt="Icône d'erreur du calcul de transport en commun"
 		/>
 		<div>
 			<p>{message}</p>
 			{solution && <p>👉️ {solution}</p>}
 		</div>
 	</section>
 )
 
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
