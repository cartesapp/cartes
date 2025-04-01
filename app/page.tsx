// Server components here
import buildPlaceJsonLd from '@/buildPlaceJsonLd'
import { buildPlaceMap } from '@/components/buildPlaceMap'
import fetchOgImage from '@/components/fetchOgImage'
import buildDescription from '@/components/osm/buildDescription'
import fetchAgency, {
	buildAgencyMeta,
} from '@/components/transport/fetchAgency'
import { ResolvingMetadata } from 'next/dist/lib/metadata/types/metadata-interface'
import { Props } from 'next/script'
import { Suspense } from 'react'
import Container from './Container'
import PaymentBanner from './PaymentBanner'
import { buildAllezPartFromOsmFeature } from './SetDestination'
import { fetchSimilarNodes } from './effects/fetchOverpassRequest'
import getName from './osm/getName'
import getUrl from './osm/getUrl'
import { getFetchUrlBase } from './serverUrls'
import { stepOsmRequest } from './stepOsmRequest'

export async function generateMetadata(
	props: Props,
	parent: ResolvingMetadata
): Promise<Metadata> {
	const searchParams = await props.searchParams

	if (searchParams.style === 'elections')
		return {
			title:
				'Cartes des résultats du premier tour, des circonscriptions et des candidat(e)s aux législatives 2024',
			description:
				'Qui est arrivé en tête dans ma circonscription ? Trouvez en un clic votre circonscription et la liste des candidats et leur score au vote des législatives 2024 le 30 juin 2024',
			openGraph: {
				images: ['/resultats-1er-tour-legislatives-2024.png'],
				url: '/elections-legislatives-2024',
			},
		}

	/* A main goal of indexatoin : transit maps */
	const agencyMeta = await buildAgencyMeta(searchParams)
	if (agencyMeta) return agencyMeta

	/* Now the indexation of places, the second main goal */
	const allez = searchParams.allez
		?.split('->')
		.filter((part) => part && part !== '')

	console.log('ALLEZ', allez)
	if (!allez?.length) return null
	const vers = allez[allez.length - 1]
	const date = new Date()
	const step = await stepOsmRequest(vers, undefined, true)
	console.log('⏳️ TIME overpass', new Date().getTime() - date.getTime())

	if (!step || step.requestState !== 'success') return null

	//console.log('OSMFEATURE', osmFeature)
	const [lon, lat] = step.center.geometry.coordinates

	const tags = step?.tags || {}
	const modifiedTime = step?.timestamp

	const title = step.name || getName(tags),
		descriptionFromOsm = buildDescription(step)

	const dateOg = new Date()
	const image = tags.image || (await fetchOgImage(getUrl(tags)))
	console.log('⏳️ TIME og', new Date().getTime() - dateOg.getTime())

	const placeMap = buildPlaceMap(lat, lon)

	const address = step.photonAddress
	const description = address
		? descriptionFromOsm + '. ' + address
		: descriptionFromOsm

	const url =
		getFetchUrlBase() +
		'/lieu?allez=' +
		encodeURIComponent(buildAllezPartFromOsmFeature(step))

	console.log('URL meta', url)
	const metadata = {
		title: title,
		description,
		alternates: {
			canonical: url,
		},
		openGraph: {
			images: image ? [image] : placeMap ? [placeMap] : [],
			modifiedTime,
			type: 'article',
			// TODO next doesn't understand this link with only searchParams. Could be
			// symtomatic of a bad choice we made : the id / name should be in the
			// path, not the searchParams ? Could it lead to RSC generation ?
			// https://github.com/vercel/next.js/issues/74689
			// Fixed temporarily with rewrites
			//
			url,
		},
	}
	return metadata
}

const Page = async (props) => {
	const searchParams = await props.searchParams
	const allez = searchParams.allez ? searchParams.allez.split('->') : []

	const newPoints = allez.map((point) => stepOsmRequest(point, undefined, true))
	const state = await Promise.all(newPoints).catch((error) => {
		console.log('Error fetching osm nodes from "allez" searchParam ', allez)
		console.log(error)
		return [] // fallback to client side
	})

	const agencyEntry = await fetchAgency(searchParams)

	// can't use next-yak for RSC where there is generateMetadata https://github.com/jantimon/next-yak/issues/112#issuecomment-2217800543

	const vers = state && state.length === 1 && state[0]

	const similarNodes = await fetchSimilarNodes(vers)

	const jsonLd = vers && (await buildPlaceJsonLd(vers))

	return (
		<main
			style={{
				height: '100%',
				minHeight: '100vh',
			}}
		>
			{jsonLd && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			)}
			<Suspense>
				<PaymentBanner parameter={searchParams.abonnement} />

				<Container
					searchParams={searchParams}
					state={state}
					agencyEntry={agencyEntry}
					similarNodes={similarNodes}
				/>
			</Suspense>
		</main>
	)
}

export default Page
