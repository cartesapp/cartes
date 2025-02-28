import départements from '@/app/lieux/departement/départements.yaml'
import { styled } from 'next-yak'
import Link from 'next/link'
import removeAccents from 'remove-accents'

const régions = départements.reduce(
	(memo, next) => ({
		...memo,
		[next.code_region]: [...(memo[next.code_region] || []), next],
	}),
	{}
)
const entries = Object.entries(régions)

export default function Régions() {
	return (
		<main>
			<h1>Annuaire des régions de France</h1>
			<p>
				En complément de la vue cartographique, explorez les lieux de France
				(sites naturels, services publics, commerces... ) région par région,
				puis département par département.
			</p>
			<p>
				Vous aurez ici accès à toute la richesse de la carte ouverte{' '}
				<a href="https://openstreetmap.fr">OpenStreetMap</a>, une carte contributive où
				chacun, du responsable d'un commerce au simple habitant d'un quartier
				peut enrichir les horaires, la description et tous les attributs d'un
				lieu.
			</p>
			<Ol>
				{entries.map(([code, list]) => {
					const name = list[0].nom_region
					const slug = removeAccents(name).toLowerCase()

					return (
						<li key={code}>
							<Link href={`/lieux/region/${slug}`}>{name}</Link>
						</li>
					)
				})}
			</Ol>
		</main>
	)
}

export const Ol = styled.ol`
	list-style-type: circle;
	padding-left: 0.8rem;
`
