import { ThemeColorsProvider } from '@/components/utils/colors'
import { Metadata } from 'next'
import { createGlobalStyle, StyleSheetManager } from 'next-styled-components'

const GlobalStyle = createGlobalStyle`
:root {
	--color1: #976aec;
	--color2: #7963e3;
	--darkColor: #121226;
}

* {
	box-sizing: border-box;
	padding: 0;
	margin: 0;
}

html,
body {
	font-family: Helvetica, Arial, sans-serif;
	max-width: 100vw;
	height: 100%;
	font-size: 100%;
	line-height: 1.7rem;

	/* contain overscroll behaviour only in vertical direction
	 * https://stackoverflow.com/questions/36212722/how-to-prevent-pull-down-to-refresh-of-mobile-chrome
	 * */

	overscroll-behavior-y: contain;
}
@media (max-width: 500px) {
	html {
		font-size: 1em;
	}
}
@media (min-width: 500px) and (max-width: 1920px) {
	html {
		font-size: 1.1em;
	}
}
@media (min-width: 1920px) {
	html {
		font-size: 1.16em;
	}
}

body {
}
main {
	padding: 0 0.6rem;
	min-height: 100%;
	max-width: 850px;
	margin: 0 auto;
	width: 100%;
	flex-grow: 1;
}
footer,
nav {
	flex-grow: 0;
	flex-shrink: 0;
}

a {
	border: none;
	font-size: inherit;
	padding: none;
	text-decoration: underline;
	text-underline-offset: 4px;
	color: var(--darkColor);
}

h1 {
	margin-top: 1.6rem;
	margin-bottom: 1rem;
	font-size: 1.9rem;
	line-height: 3rem;
	font-size: 200%;
}
h2 {
	margin-top: 1.4rem;
	margin-bottom: 1rem;
	font-size: 1.4rem;
	font-size: 160%;
}
@media (max-width: 800px) {
	h1 {
		font-size: 160%;
		line-height: 2.2rem;
	}
	h2 {
		font-size: 140%;
		line-height: 2.2rem;
	}
}
h3 {
	margin-top: 1rem;
	margin-bottom: 0.6rem;
	font-size: 1.2rem;
	font-size: 130%;
}
h4 {
	margin-top: 0.6rem;
	margin-bottom: 0.4rem;
	font-size: 1rem;
	font-size: 110%;
}
h5 {
	margin-top: 0.4rem;
	margin-bottom: 0.2rem;
	font-size: 0.9rem;
}
h6 {
	margin-top: 0.4rem;
	margin-bottom: 0.2rem;
	font-size: 0.9rem;
	color: var(--lighterTextColor);
}

h1,
h2,
h3,
h4,
h5,
h6 {
	color: inherit;
	font-family: Arial, Helvetica, sans-serif;
	font-weight: 300;
	scroll-margin-top: 1rem; /* Add a margin for anchor links */
}

p {
	margin: 0 0 0.4rem;
}
small {
	line-height: 1rem;
	display: inline-block;
}

blockquote {
	border-left: 0.4rem solid var(--color);
	padding-left: 0.6rem;
	margin: 0.6rem 0;
}

fieldset {
	border: 0;
	margin: 0;
	min-width: 0;
	padding: 0.01em 0 0;
}

button {
	background: none;
	border: none;
	border-radius: 0.2em;
	padding: 0 1em;
	font-size: 100%;
	font-family: inherit;
	color: inherit;
}

button:enabled {
	cursor: pointer;
}

details > summary {
	cursor: pointer;
}
`

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
		metadataBase: new URL('https://cartes.app'),
		openGraph: {
			images: [image],
			type: 'article',
			publishedTime: '2024-05-10T00:00:00.000Z',
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
			</head>
			<body>
				<StyleSheetManager>
					<GlobalStyle />
					<ThemeColorsProvider>{children}</ThemeColorsProvider>
				</StyleSheetManager>
			</body>
		</html>
	)
}
