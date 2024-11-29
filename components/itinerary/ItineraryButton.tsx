 import {css} from 'next-yak'
 import { MapButton } from '../MapButtons'
 
 export default function ItineraryButton({
 	setIsItineraryMode,
 	isItineraryMode,
 	reset,
 }) {
 	return (
 		<MapButton $active={isItineraryMode}>
 			<button
 				onClick={() => setIsItineraryMode(!isItineraryMode)}
 				title="Calculer un itinéraire"
 			>
 				<div>
 					<ItineraryIcon />
 				</div>
 			</button>
 			{isItineraryMode && (
 				<button
 					onClick={() => reset()}
 					css={css`
 						position: absolute;
 						bottom: -0.6rem;
 						right: -1.7rem;
 					`}
 				>
 					<ResetIcon />
 				</button>
 			)}
 		</MapButton>
 	)
 }
 
 export const ItineraryIcon = () => (
 	<img
 		css={css`
 			width: 1.4rem;
 			height: 1.4rem;
 			margin: 0 !important;
 		`}
 		src={'/itinerary-circle-plain.svg'}
 		width="100"
 		height="100"
 		alt="Icône itinéraire"
 	/>
 )
 export const ResetIcon = () => (
 	<img
 		css={css`
 			width: 1.4rem;
 			height: 1.4rem;
 		`}
 		src={'/trash.svg'}
 		width="100"
 		height="100"
 		alt="Icône poubelle"
 	/>
 )
