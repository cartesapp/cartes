 import Link from 'next/link'
 import { Screens, WebStore } from './UI'
 import { PresentationWrapper } from './UI.tsx'
 import Logo from '@/public/logo.svg'
 import WebIcon from '@/public/web.svg'
 import Image from 'next/image'
 import './devices.css'
 import Phone from './Phone'
 import {css} from 'next-yak'
 import { description } from '../layout'
 import CTA from './CTA'
 
 const iframeStyle = `
 					width: 20rem;
 					height: 36rem;
 					margin: 0 auto;
 					margin-bottom: 5vh;
 					display: block;
 					border-radius: 1rem;
 					border: 3px solid var(--darkColor);
 					box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px,
 						rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
 `
 const iframeCode = `
 				<iframe
 					src="https://cartes.app/?allez=Little+Beetles|n5352517991|-1.6826|48.1118"
 					style="${iframeStyle}"
 				></iframe>
 				`
 
 export const metadata: Metadata = {
 	title: 'Des cartes libres, modernes et souveraines',
 	description,
 }
 
 export default function () {
 	return (
 		<PresentationWrapper>
 			<section>
 				<header>
 					<h1>
 						<Image src={Logo} alt="Logo de cartes.app" /> Cartes
 					</h1>
 					<h2>Libres, modernes et souveraines.</h2>
 				</header>
 				<WebStore>
 					<Link href="/">
 						<Image src={WebIcon} alt="Icône représentation le World Wide Web" />
 						<div>
 							<small>Disponible sur</small>
 							<div>le Web</div>
 						</div>
 					</Link>
 				</WebStore>
 				<Screens>
 					<Phone imgSrc={'/screenshots/trépassés.png'} />
 					<Phone imgSrc={'/screenshots/cordée.png'} />
 					<Phone imgSrc={'/screenshots/bus.png'} />
 				</Screens>
 			</section>
 			<h2>Des cartes dégooglisées</h2>
 			<p>
 				L'essentiel des applications de nos smartphones qui affichent une carte,
 				de Citymapper à l'application de votre réseau de bus (par exemple Star à
 				Rennes ou Korrigo en Bretagne) sont dépendantes de Google : quand vous
 				l'utilisez, votre téléphone envoie des requêtes à Google et notamment
 				votre position.
 			</p>
 			<p>
 				Cette main-mise de Google sur l'éco-système Android qui représente 75 %
 				des téléphones en France est inquiétante et pourrait être jugée
 				anti-concurrentielle. Côté iPhone, Apple Maps joue le même rôle, iOS
 				étant cadenassé par Apple pour inciter voir obliger les développeurs
 				d'applications à passer par leur offre logicielle privée.
 			</p>
 			<p>
 				Cartes est{' '}
 				<a href="https://cartes.app/blog/maps-cartes">
 					une nouvelle <em>maps</em>
 				</a>
 				, faite autrement. Française et{' '}
 				<a href="/blog/souverainete-cartographique">souveraine</a>.
 			</p>
 
 			<CTA>Tester Cartes</CTA>
 			<h2>Compléter les applications mobiles OpenStreetMap</h2>
 			<p>
 				OpenStreetMap est le Wikipedia des cartes : chacun peut y ajouter un
 				nouveau lieu, modifier l'horaire d'un coiffeur, placer un arbre sur la
 				carte, mettre à jour la parcelle de son jardin.
 			</p>
 			<p>
 				Cartes peut être vu comme le pendant Web des belles applications{' '}
 				<a href="https://organicmaps.app/">Organic Maps</a> et{' '}
 				<a href="https://osmand.net/">OsmAnd</a>.
 			</p>
 			<p>
 				Ces applications nous proposent des cartes hors ligne fiables pour une
 				rando loin d'une 4G puissante, ou pour se déconnecter en pleine ville.
 				C'est essentiel mais souvent, on désire en parallèle aussi voir les
 				photos d'un lieu touristique, la devanture d'un commerce, les derniers
 				horaires du bus qui nous amène au boulot ou des liens avec d'autres
 				sources de données diverses.
 			</p>
 			<p>
 				Cartes ne s'installe pas, elle s'utilise : il suffit d'ouvrir n'importe
 				quel navigateur de taper{' '}
 				<a href="/">
 					<strong>cartes.app</strong>
 				</a>{' '}
 				dans la barre d'adresse. Plus besoin du Play Store, de l'App Store, du
 				Galaxy Store ou encore du Huawei store : vos amis n'auront pas besoin
 				d'installer une nième application pour ouvrir le lien du restaurant où
 				vous comptez vous retrouver ce soir !
 			</p>
 			<p>
 				<a href="https://www.openstreetmap.org/">OpenStreetMap</a>, c'est la
 				fondation sur laquelle Cartes est construite, mais de nombreuses autres
 				sources de données y sont intégrées.
 			</p>
 			<h2>Répondre à l'urgence écologique et politique</h2>
 			<p>
 				Les transports représentent un quart de notre empreinte carbone, et la
 				voiture individuelle 75 % du secteur des transports.
 			</p>
 			<p>
 				L'équation est donc simple : bannir au plus vite la voiture individuelle
 				thermique quand elle n'est pas remplie avec plus de 3 passagers.
 			</p>
 			<p>
 				La voiture, c'est une destruction du climat, mais aussi un poste de
 				dépenses monstrueux pour les ménages : elle coûte en moyenne 400 à 500 €
 				/ mois, et un trajet en voiture revient très souvent{' '}
 				<a href="https://futur.eco/cout-voiture">plus cher que le train</a> !
 			</p>
 			<p>
 				Ce coût inaccessible pour de plus en plus de ménages, qui entraine un
 				sentiment d'abandon notamment des zones rurales populaires, est l'un des{' '}
 				<a href="https://www.arte.tv/fr/videos/117898-000-A/pays-bas-l-extreme-droite-prospere-sur-l-abandon-des-campagnes">
 					principaux carburant de la montée de l'extrême-droite
 				</a>
 				.
 			</p>
 			<p>
 				L'interface de calcul d'itinéraires de Cartes acte ce principe, et
 				propose en premier lieu des moyens de transport écologiques :
 			</p>
 			<ul
 				css={css`
 					padding-left: 1rem;
 				`}
 			>
 				<li>
 					transports en commun (bus, tram, métro, TER, train de nuit, TGV)
 				</li>
 				<li>
 					marche et vélo avec un accent sur la sécurité des trajets cyclables
 				</li>
 				<li>
 					la voiture de préférence électrique remplie grâce au covoiturage
 					informel (entre amis, en famille) et organisé par des plateformes
 				</li>
 				<li>
 					une combinaison multimodale de ces modes écologiques pour rattraper la
 					flexibilité du mode voiture
 				</li>
 			</ul>
 			<h2>Un service national d'information transport</h2>
 			<p>
 				La France a décidé de décentraliser la gestion de ses réseaux de bus. Ce
 				choix apporte de la flexibilité aux territoires, mais complexifie
 				l'information voyageur pour les français.
 			</p>
 			<p>
 				Développer pour chaque métropole et communauté de commune de France une
 				nouvelle application de plans de transport et de calcul d'itinéraire,
 				qui vient avec son logo, son nom sorti du département marketing, c'est
 				aussi extrêmement couteux.
 			</p>
 			<img
 				src="/sotm/bingo/bingo.png"
 				alt="Un échantillon de logos de réseaux de transports français"
 			/>
 			<p>
 				Cartes propose une interface nationale unifiée d'information voyageur
 				pour les transports en commun français, du bus scolaire au TGV. Elle est
 				lancée en pilote sur la région Bretagne / Pays de la Loire, et grâce au
 				service public transport.data.gouv.fr, elle se déploie progressivement
 				sur l'ensemble de l'hexagone.{' '}
 				<a href="/transport-en-commun">Suivez le déploiement ici</a>.
 			</p>
 			<p>
 				Que vous viviez ou visitiez Portsall, Menton, Saint-Étienne ou Verneuil
 				d'Avre et d'Iton, trouver votre ligne de bus et ses horaires consistera
 				juste à taper{' '}
 				<a href="/">
 					<strong>cartes.app</strong>
 				</a>
 				, vous géolocaliser et activer le mode transport.
 			</p>
 			<h2>Intégrez une carte à votre site en 30 secondes</h2>
 
 			<p>
 				Vous êtes un club sportif, une association, un commerce, une
 				administration avec des locaux ouverts au public ? Il est important de
 				montrer une carte à vos utilisateurs.{' '}
 			</p>
 			<p>
 				Vous pouvez intégrer notre carte souveraine en un simple bout de code
 				sur votre Wordpress ou autre outil de gestion de site Web, gratuitement,
 				sans envoyer les données de vos utilisateurs à Google.
 			</p>
 			<p>Voici un exemple sur un commerce à Rennes :</p>
 			<blockquote
 				css={css`
 					line-height: 1rem;
 					margin-bottom: 1rem;
 					border: 1px dashed var(--color);
 					padding: 0.4rem;
 					font-size: 80%;
 					border-radius: 0.2rem;
 				`}
 			>
 				{iframeCode}
 			</blockquote>
 
 			<iframe
 				src="https://cartes.app/?allez=Little+Beetles|n5352517991|-1.6826|48.1118"
 				css={css(iframeStyle)}
 			/>
 			<p>
 				Pour intégrer <strong>votre lieu</strong>, remplacez simplement le
 				contenu de l'attribut source ci-dessus par l'URL de votre lieu sur
 				cartes.app.
 			</p>
 			<p>
 				Votre lieu manque d'informations ? Téléphone, description, type de
 				cuisine, photo : en deux clics, ajoutez ces informations sur{' '}
 				<a href="https://www.openstreetmap.fr/contribuer/">OpenStreetMap</a>.
 			</p>
 			<h2>Un projet entièrement gratuit, libre et open-source</h2>
 			<p>
 				Tout le code de Cartes est ouvert sur la plateforme{' '}
 				<a href="https://github.com/laem/cartes">Github</a>. Il n'y a pas grand
 				chose de plus à dire : tout est transparent et réutilisable par d'autres
 				équipes, associations, collectivités ou entreprises, tant qu'elles
 				reversent leur contribution à la communauté.
 			</p>
 			<p>
 				Des dizaines de contributeurs ont déjà aidé à améliorer l'outil.{' '}
 				<a href="https://github.com/laem/cartes/issues">Pourquoi pas vous ?</a>.
 			</p>
 			<p>
 				✉️ Pour nous contacter directement, c'est{' '}
 				<a href="https://kont.me/contact">par ici</a>.
 			</p>
 			<CTA>Tester Cartes</CTA>
 		</PresentationWrapper>
 	)
 }
 
 // https://jhildenbiddle.github.io/css-device-frames/#/
