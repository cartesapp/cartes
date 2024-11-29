 import { buildAllezPart } from '@/app/SetDestination'
 import Link from 'next/link'
 import ItineraryIcon from '@/public/itinerary-circle-plain.svg'
 import Image from 'next/image'
 import { motion } from 'framer-motion'
 import { encodePlace } from '@/app/utils'
 import { css } from 'next-yak'
 
 export default function ({ setSearchParams, data: [from, to] }) {
 	return (
 		<AnimatedSearchProposition>
 			<Link
 				href={setSearchParams(
 					{
 						allez:
 							buildAllezPart(
 								from.name,
 								encodePlace(from.featureType, from.osmId),
 								from.longitude,
 								from.latitude
 							) +
 							'->' +
 							buildAllezPart(
 								to.name,
 								encodePlace(to.featureType, to.osmId),
 								to.longitude,
 								to.latitude
 							),
 					},
 					true
 				)}
 			>
 				<Image src={ItineraryIcon} alt="Lancer un itinéraire" />
 				<span>
 					Itinéraire {from.name}
 					<span
 						css={css`
 							margin: 0 0.4rem;
 						`}
 					>
 						➤
 					</span>{' '}
 					{to.name}
 				</span>
 			</Link>
 		</AnimatedSearchProposition>
 	)
 }
 export const AnimatedSearchProposition = ({ children }) => (
 	<motion.section
 		initial={{ opacity: 0, scale: 0, x: -600 }}
 		animate={{ opacity: 1, scale: 1, x: 0 }}
 		css={css`
 			background: white;
 			border-radius: 0.4rem;
 			padding: 0.6rem;
 			margin-top: 0.8rem;
 			border: 1px solid var(--lightestColor);
 			a {
 				display: flex;
 				align-items: center;
 				text-decoration: none;
 				img {
 					width: 1.4rem;
 					height: auto;
 					margin-right: 0.6rem;
 				}
 			}
 		`}
 	>
 		{children}
 	</motion.section>
 )
