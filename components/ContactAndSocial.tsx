 import Emoji from './Emoji'
 import Image from 'next/image'
 import css from './css/convertToJs'
 import { atOrUrl } from '@/app/utils'
 
 export default function ContactAndSocial({
 	email,
 	facebook,
 	instagram,
 	whatsapp,
 	youtube,
 	linkedin,
 	siret,
 }) {
 	return (
 		<div
 			css={css`
 				margin-bottom: 0.6rem;
 			`}
 		>
 			{email && (
 				<a
 					href={`mailto:${email}`}
 					target="_blank"
 					title="Contacter via courriel"
 				>
 					<Emoji e="📧" />
 				</a>
 			)}
 			{facebook && (
 				<a
 					href={atOrUrl(facebook, 'https://facebook.com')}
 					target="_blank"
 					title="Compte Facebook"
 				>
 					<Emoji extra="E042" />
 				</a>
 			)}
 			{whatsapp && (
 				<a
 					href={atOrUrl(whatsapp, 'https://wa.me')}
 					target="_blank"
 					title="Discuter sur Whatsapp"
 				>
 					<Emoji extra="E248" />
 				</a>
 			)}
 			{instagram && (
 				<a
 					href={atOrUrl(instagram, 'https://instagram.com')}
 					target="_blank"
 					title="Compte Instagram"
 				>
 					<Emoji extra="E043" />
 				</a>
 			)}
 			{youtube && (
 				<a
 					href={atOrUrl(youtube, 'https://youtube.com')}
 					target="_blank"
 					title="Chaîne Youtube"
 				>
 					<Emoji extra="E044" />
 				</a>
 			)}
 			{linkedin && (
 				<a
 					href={atOrUrl(linkedin, 'https://linkedin.com/company')}
 					target="_blank"
 					title="Compte LinkedIn"
 				>
 					<Emoji extra="E046" />
 				</a>
 			)}
 			{siret && (
 				<a
 					href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${siret}`}
 					target="_blank"
 					title="Fiche entreprise sur l'annuaire officiel des entreprises"
 					css={css`
 						display: flex;
 						align-items: center;
 					`}
 				>
 					<Image
 						src={'/annuaire-entreprises.svg'}
 						alt="logo Marianne représentant l'annuaire des entreprises"
 						css={css`
 							margin: 0 0.3rem 0 0.2rem;
 							width: 1.4rem;
 							height: auto;
 						`}
 						width={14}
 						height={14}
 					/>
 					<span>fiche entreprise</span>
 				</a>
 			)}
 		</div>
 	)
 }
