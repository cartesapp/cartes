 import CaptureSpacebar from '@/components/diapos/CaptureSpacebar'
 import { DiapoWrapper } from '@/components/diapos/Wrapper'
 import Logo from '@/public/logo.svg'
 import Image from 'next/image'
 import { PresentationWrapper } from '../UI.tsx'
 
 import Presentation1 from './presentation1.mdx'
 import Presentation2 from './presentation2.mdx'
 import Presentation3 from './presentation3.mdx'
 import Presentation4 from './presentation4.mdx'
 import {css} from 'next-yak'
 
 export const metadata: Metadata = {
 	title: 'Cartes - Présentation SOTM 2024',
 	description:
 		'Présentation de cartes.app à la conférence de cartes (maps) OpenStreetMaps State of the Map (SOTM) 2024 à Lyon.',
 }
 
 export default function () {
 	return (
 		<CaptureSpacebar>
 			<DiapoWrapper>
 				<section>
 					<PresentationWrapper>
 						<header>
 							<h1>
 								<Image src={Logo} alt="Logo de cartes.app" /> Cartes
 							</h1>
 							<h2>
 								State of the Map{' '}
 								<span
 									css={css`
 										color: crimson;
 									`}
 								>
 									Lyon
 								</span>{' '}
 								2024
 							</h2>
 						</header>
 					</PresentationWrapper>
 					<small
 						css={css`
 							font-size: 80%;
 							color: gray;
 						`}
 					>
 						Suivre en ligne sur son ordi : cartes.app/prez
 					</small>
 				</section>
 				<Presentation1 />
 				<Presentation2 />
 				<Presentation3 />
 				<Presentation4 />
 			</DiapoWrapper>
 		</CaptureSpacebar>
 	)
 }
 
 // https://jhildenbiddle.github.io/css-device-frames/#/
