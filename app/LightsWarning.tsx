 import sunCalc from 'suncalc'
 import Image from 'next/image'
 
 const dateFormatter = Intl.DateTimeFormat('fr-FR', {
 	hour: 'numeric',
 	minute: 'numeric',
 })
 
 const roundFormat = (date) => {
 	const dateString = dateFormatter.format(date)
 
 	const [hours, minutes] = dateString.split(':')
 
 	const simplified =
 		+minutes <= 15
 			? +hours + 'h'
 			: +minutes <= 30 || +minutes <= 45
 			? `${hours}h30`
 			: +hours + 1 + 'h'
 	return '' + simplified
 }
 export default function LightsWarning({ longitude, latitude }) {
 	// These times seem more secure than sunrise and sunset
 	const { goldenHourEnd, goldenHour } = sunCalc.getTimes(
 		new Date(),
 		latitude,
 		longitude
 	)
 
 	return (
 		<div
 			css={css`
 				margin-top: 0.6rem;
 				strong {
 					background: var(--darkerColor);
 					color: white;
 					font-weight: normal;
 					padding: 0 0.3rem;
 					border-radius: 0.2rem;
 					box-shadow: -1px 0px 1px red;
 					white-space: nowrap;
 				}
 				> small {
 					display: flex;
 					align-items: center;
 					justify-content: end;
 				}
 				img {
 					height: 1.1rem;
 					width: auto;
 					margin-right: 0.4rem;
 				}
 			`}
 		>
 			<small>
 				<Image
 					src="/bike-lights.svg"
 					width="10"
 					height="10"
 					alt="Icône représentant la lumière rouge arrière d'un vélo"
 				/>{' '}
 				<span>
 					N'oublie pas de briller{' '}
 					<strong>avant {roundFormat(goldenHourEnd)}</strong> et{' '}
 					<strong>après {roundFormat(goldenHour)}</strong>
 				</span>
 			</small>
 		</div>
 	)
 }
