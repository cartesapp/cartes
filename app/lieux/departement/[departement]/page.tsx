import départements from '../départements.yaml'
import removeAccents from 'remove-accents'
import {
	communesLimit,
	fetchDepartementCommunes,
	populationLimit,
} from '../fetchCommunes'
import { Metadata } from 'next'
import Link from 'next/link'
import removeAccent from 'remove-accents'
import { slugify } from '../../region/[region]/page'
import { Ol } from '../../Régions'

export async function generateMetadata(
	{ params, searchParams }: Props,
	parent: ResolvingMetadata
): Promise<Metadata> {
	// read route params
	const departement = (await params).departement

	// fetch data

	const name = decodeURIComponent(departement)
	return {
		title: `Département ${name} - Cartes`,
		description: `Parcourez les communes de la région ${name}, et les lieux et commerces présents dans chacune.`,
	}
}

export default async function (props) {
	const { departement } = await props.params

	const found = départements.find(
		(d) => slugify(d.nom) === decodeURIComponent(departement)
	)

	if (!found) return <p>Département non trouvé</p>

	const communes = await fetchDepartementCommunes(found.code)

	return (
		<main>
			<Link
				href={`/lieux/region/${removeAccent(found.nom_region).toLowerCase()}`}
			>
				⭠ Revenir à la région {found.nom_region}
			</Link>
			<h1>
				Annuaire des lieux et commerces du département {found.nom}{' '}
				<small>({found.code})</small>
			</h1>
			<p>
				Découvrez ville par ville les lieux et commerces du département{' '}
				{found.nom}.
			</p>
			<h2>Par commune </h2>
			<p>
				Sont affichées les {communesLimit} premières communes de plus de{' '}
				{populationLimit} habitants.
			</p>
			<Ol>
				{communes.map((commune) => (
					<li key={commune.code}>
						<Link href={`/lieux/${commune.nom}`}>{commune.nom}</Link>
					</li>
				))}
			</Ol>
		</main>
	)
}
