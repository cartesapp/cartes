 import Logo from '@/public/logo.svg'
 import Image from 'next/image'
 import css from './css/convertToJs'
 import Link from 'next/link'
 
 export default function ({ small }) {
 	return (
 		<header>
 			<Link
 				href="/"
 				css={css`
 					text-decoration: none;
 				`}
 			>
 				<h1
 					style={
 						small
 							? css`
 									font-size: 130%;
 									margin-bottom: 0.4rem;
 							  `
 							: ''
 					}
 				>
 					<Image src={Logo} alt="Logo de cartes.app" /> Cartes
 				</h1>
 			</Link>
 		</header>
 	)
 }
