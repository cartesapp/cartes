 'use client'
 import {styled} from 'next-yak'
 export default function TransitLoader({
 	text = 'Calcul des transports en commun',
 }) {
 	return (
 		<Loader>
 			<small>{text}</small>
 			<div />
 		</Loader>
 	)
 }
 
 const Loader = styled.div`
 	/* HTML: <div class="loader"></div> */
 	margin: 1rem auto 0.6rem;
 	display: flex;
 	justify-content: center;
 	flex-direction: column;
 	align-items: center;
 
 	small {
 		margin-bottom: 0.4rem;
 	}
 	> div {
 		width: 120px;
 		height: 20px;
 		background: radial-gradient(
 				circle closest-side,
 				var(--lightColor) 94%,
 				#0000
 			)
 			50% 50% / calc(50% + 10px) 70% repeat-x var(--darkColor);
 		border-radius: 1rem;
 		animation: l9 1s infinite cubic-bezier(0.3, 1, 0, 1);
 		@keyframes l9 {
 			100% {
 				background-position: calc(200% - 5px);
 			}
 		}
 	}
 `
