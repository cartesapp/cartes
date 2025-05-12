import { ThemeColorsProvider } from '@/components/utils/colors'
import { Metadata } from 'next'
import '../globals.css'
import Script from 'next/script'
import { getFetchUrlBase } from './serverUrls'

const title = `Cartes`
export const description =
	"Des cartes libres et gratuites sur le Web, alternatives aux maps Google et Apple, pour trouver un commerce, un lieu, visiter une ville, calculer un trajet à pieds, en vélo, en transport en commun, en train. Dans un premier temps, l'accent est mis sur la France hexagonale."

//old description to be rewritter when we really cover train+vélo
//"Comment voyager sans voiture ? Comment gérer les derniers kilomètres après l'arrivée à la gare ? Comment se déplacer pendant le weekend ? Où louer une voiture ou un vélo ? On vous guide, pour que le voyage sans voiture personnelle soit un plaisir."

export async function generateMetadata(
	props: Props,
	parent?: ResolvingMetadata
): Promise<Metadata> {
	const searchParams = await props.searchParams
	const params = await props.params
	const image = `/vignette.png`
	return {
		title,
		description,
		metadataBase: new URL(getFetchUrlBase()),
		openGraph: {
			images: [image],
			type: 'article',
			publishedTime: '2024-05-10T00:00:00.000Z',
			url: 'https://cartes.app',
			siteName: 'Cartes',
		},
	}
}
export default function ({ children }) {
	return (
		<html lang="fr">
			<head>
				<link
					rel="search"
					type="application/opensearchdescription+xml"
					title="Cartes"
					href="https://cartes.app/cartes-search.xml"
				/>
				<link
					rel="alternate"
					type="application/rss+xml"
					title="Le blog de Cartes"
					href="https://cartes.app/feed.xml"
				/>
			</head>
			<body>
				<ThemeColorsProvider>{children}</ThemeColorsProvider>
			</body>
			<Script
				async
				src="https://stats.cartes.app/script.js"
				data-website-id="1135c966-cb6e-4678-8d4c-6926dd994456"
			></Script>
		</html>
	)
}
