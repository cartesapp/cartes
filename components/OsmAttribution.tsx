 'use client'
 import logoOsm from '@/public/openstreetmap.svg'
 import { css } from 'next-yak'
 import Image from 'next/image'
 import Link from 'next/link'
 
 export default function OsmAttribution() {
 	return (
 		<span
 			css={css`
 				img {
 					vertical-align: middle;
 					width: 1.8rem;
 					height: auto;
 					margin-right: 0.4rem;
 				}
 				a {
 					text-wrap: nowrap;
 				}
 			`}
 		>
 			<Link href="https://www.openstreetmap.fr">
 				<Image src={logoOsm} alt="Logo OpenStreetMap" />
 				<span>OpenStreetMap</span>
 			</Link>
 		</span>
 	)
 }
