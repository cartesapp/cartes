 import {css} from 'next-yak'
 import Link from 'next/link'
 import { PresentationWrapper } from '../presentation/UI'
 import CTA from '@/app/presentation/CTA'
 import StaticPageHeader from '@/components/StaticPageHeader'
 
 const title = 'Calculer un itinéraire en France'
 const description = `
 Qu'il s'agisse d'un voyage ou d'un déplacement dans votre ville ou
 département, Cartes vous propose le trajet idéal et vous laisse
 choisir entre plusieurs modes : marche, vélo, transports en commun
 (bus, tram, métro, car, train), voiture.
 `
 export const metadata: Metadata = {
 	title,
 	description,
 }
 export default function () {
 	return (
 		<PresentationWrapper>
 			<StaticPageHeader small={true} />
 			<header>
 				<h1>{title}</h1>
 				<p>{description}</p>
 			</header>
 			<CTA>Calculer un itinéraire</CTA>
 			<section
 				css={css`
 					margin: 2rem 0;
 				`}
 			>
 				<h2>Transports en commun</h2>
 				<p>
 					Tous les transports en commun de France seront disponibles. Pour
 					l'instant, nous déployons les réseaux progressivement, un à un.
 				</p>
 				<p>
 					Découvrez{' '}
 					<Link href="/transport-en-commun">les réseaux déjà disponibles.</Link>
 				</p>
 				<h2>Trajet en vélo</h2>
 				<p>
 					Le vélo est le mode de transport le plus adapté dans les villes
 					denses, où la voiture se retrouve souvent coincée dans les bouchons,
 					surtout aux heures de pointe.{' '}
 				</p>
 				<p>
 					Les itinéraires cyclables sécurisés sont affichés en vert sur la
 					carte, le dénivelé exprimé en dégradé (rouge : pente importante) vous
 					permet d'éviter les pentes (ou de provoquer si c'est votre but !).
 				</p>
 				<h2>Trajet en voiture</h2>
 				<p>
 					Les trajets en voiture sont déjà disponibles et seront améliorés au
 					fil du temps. La voiture est un mode de transport particulièrement
 					polluant : la voiture électrique et remplie via le covoiturage y sera
 					présentée comme à privilégier.
 				</p>
 				<p>
 					Le coût du trajet en voiture y sera affiché, ainsi que l'empreinte
 					carbone du voyage. Le coût calculé est complet, grâce au modèle de
 					calcul de référence{' '}
 					<Link href="https://futur.eco/cout-voiture">futureco</Link>.
 				</p>
 				<p>
 					Il vous sera possible d'optimisez votre trajet pour privilégier
 					l'autoroute, ou les routes secondaires.
 				</p>
 				<p>
 					Pour éviter de rouler dans les métropoles et les villes qui ont décidé
 					d'exclure les voitures des centres, les parkings relais seront mis en
 					évidence, tout comme les ZFE (Zone à faible émission).
 				</p>
 			</section>
 		</PresentationWrapper>
 	)
 }
