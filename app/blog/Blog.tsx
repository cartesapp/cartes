 import Logo from '@/public/logo.svg'
 import { css } from 'next-yak'
 import Image from 'next/image'
 import Link from 'next/link'
 import { List } from './UI'
 import { dateCool } from './utils'
 
 export const description =
 	"Découvrez l'histoire, les nouveautés et le futur de Cartes.app"
 
 export default function Blog({ articles }) {
 	return (
 		<main>
 			<nav
 				css={css`
 					margin-top: 1rem;
 				`}
 			>
 				<Link href="/">
 					<Image
 						src={Logo}
 						alt="Logo de Cartes.app"
 						width="100"
 						height="100"
 						css={css`
 							width: 2rem;
 							height: auto;
 							margin-right: 0.6rem;
 							vertical-align: middle;
 						`}
 					/>
 					Revenir sur la carte
 				</Link>
 			</nav>
 			<h1>Le blog de Cartes.app</h1>
 			<p>{description}</p>
 			<p>
 				Pour l'instant, nous sommes dans une phase de construction : l'objectif
 				est de sortir une version 1 en 2024, et ces articles en expliquent
 				l'avancement. L'application reste largement utilisable, mais
 				attendez-vous à quelques bugs.
 			</p>
 			<List>
 				{articles.map(({ url, date, titre }) => (
 					<li key={url}>
 						<div>
 							<Link
 								href={url}
 								dangerouslySetInnerHTML={{ __html: titre.html }}
 							/>
 						</div>
 						<small>publié le {dateCool(date)}</small>
 					</li>
 				))}
 			</List>
 		</main>
 	)
 }
