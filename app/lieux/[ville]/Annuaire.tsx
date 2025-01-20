import QuickFeatureSearch from '@/app/QuickFeatureSearch'
import {
	computeBbox,
	fetchOverpassRequest,
} from '@/app/effects/fetchOverpassRequest'
import { PresentationWrapper } from '@/app/presentation/UI'
import StaticPageHeader from '@/components/StaticPageHeader'
import { buildPlaceMap } from '@/components/buildPlaceMap'
import { getCategories } from '@/components/categories'
import { styled } from 'next-yak'
import Image from 'next/image'
import fetchVille from './fetchVille'
import Link from 'next/link'
import removeAccent from 'remove-accents'

const description = ''
export default async function Page({ params, searchParams }) {
	const { ville: villeName } = params

	const ville = await fetchVille(villeName)
	console.log('VILLE', ville)

	const [lon, lat] = ville.mairie.coordinates
	const lonLatObject = { lat, lon }

	const [categoryNames, categories] = getCategories(searchParams)
	//const bbox2 = computeBbox(lonLatObject)
	const geoJsonBbox = ville.bbox.coordinates[0]
	const b = geoJsonBbox
	const bbox = [b[0][1], b[0][0], b[2][1], b[1][0]]

	const results = categories?.length
		? await Promise.all(
				categories.map((category) => fetchOverpassRequest(bbox, category))
		  )
		: []

	console.log('CAT', categories, bbox)
	const quickSearchFeaturesMap = Object.fromEntries(
		results.map((categoryResults, i) => [categoryNames[i], categoryResults])
	)

	console.log(quickSearchFeaturesMap)

	const query = new URLSearchParams(searchParams).toString()
	return (
		<PresentationWrapper>
			<StaticPageHeader small={true} />
			<Link
				href={`/lieux/departement/${removeAccent(
					ville.departement.nom
				).toLowerCase()}`}
			>
				⭠ Villes du département {ville.departement.nom}
			</Link>
			<header>
				<h1>Annuaire des lieux de {ville.nom} </h1>
				<small>({ville.codesPostaux.join(', ')})</small>
				<p>{description}</p>
				<Link
					href={`/?${query}#13/${lat}/${lon}`}
					title="Ouvrir la carte en plein écran"
				>
					<PlaceImage
						src={buildPlaceMap(lat, lon, 13)}
						width="200"
						height="200"
						alt={'Miniature de la carte de ' + ville}
					/>
				</Link>
			</header>
			<QuickFeatureSearch
				{...{
					quickSearchFeaturesMap,
					searchParams,
					noPhotos: true,
					center: [lonLatObject.lon, lonLatObject.lat],
					annuaireMode: true,
				}}
			/>
		</PresentationWrapper>
	)
}

const PlaceImage = styled(Image)`
	width: 14rem;
	height: 8rem;
	object-fit: cover;
	border-radius: 2rem;
`
