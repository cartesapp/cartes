import { computeHumanDistance } from '@/app/RouteRésumé'
import { computeBbox, findCategory } from '@/app/effects/fetchOverpassRequest'
//import useOverpassRequest from '@/app/effects/useOverpassRequest'
import { OpenIndicator, getOh } from '@/app/osm/OpeningHours'
import { bearing } from '@turf/bearing'
import turfDistance from '@turf/distance'
import { styled } from 'next-yak'
import FeatureLink, { DynamicSearchLink } from './FeatureLink'
import categoryIconUrl from './categoryIconUrl'
import { capitalise0, sortBy } from './utils/utils'

export default function SimilarNodes({ node, similarNodes: features }) {
	const { tags } = node

	// find the category of this node (we need one)
	const category = findCategory(tags)
	if (!category) return null

	const { coordinates } = node.center.geometry

	const [lon, lat] = coordinates

	const bbox = computeBbox({ lon, lat })

	// I comment the next line since I think it is useless
	// (the simmilar nodes have already been searched)
	//const [quickSearchFeaturesMap] = useOverpassRequest(bbox, [category])

	const featuresWithDistance =
		features &&
		features
			.filter(
				(feature) => feature.osmCode !== node.osmCode && feature.tags?.name
			)
			.map((feature) => {
				const { coordinates: coordinates2 } = feature.center.geometry
				return {
					...feature,
					distance: turfDistance(coordinates2, coordinates),
					bearing: bearing(coordinates, coordinates2),
				}
			})

	const closestFeatures =
		features && sortBy(({ distance }) => distance)(featuresWithDistance)

	/*
	 * Trouver la catégorie du lieu
	 * lancer une requête Overpass pour les éléments similaires autour
	 * afficher les plus proches surtout pour le SEO dans un premier temps, puis graphiquement
	 * comme des cartes sur google dans un second temps
	 * mettre un lien vers la recherche category=
	 * ajouter une liste de résultats à la recherche par catégorie
	 *
	 * */

	const name = capitalise0(category.name)
	const isOpenByDefault = category['open by default']
	const imageUrl = categoryIconUrl(category)
	return (
		<Wrapper>
			{closestFeatures?.length ? (
				<>
					<h3>{name} proches</h3>
					<NodeList
						nodes={closestFeatures.slice(0, 10)}
						isOpenByDefault={isOpenByDefault}
					/>
					{closestFeatures.length > 10 && (
						<details>
							<summary>Tous les {name} proches</summary>
							<NodeList
								nodes={closestFeatures.slice(10)}
								isOpenByDefault={isOpenByDefault}
							/>
						</details>
					)}
				</>
			) : (
				<section>
					<h3>{name} proches</h3>
					<p>
						<small>
							Rien trouvé. Essayez une <DynamicSearchLink category={category} />{' '}
							sur la carte.
						</small>
					</p>
				</section>
			)}
		</Wrapper>
	)
}

const Wrapper = styled.section`
	margin-top: 2rem;
	background: white;
	border: 1px solid var(--lightestColor);
	border-radius: 0.4rem;
	padding: 0.3rem 0.8rem 0.8rem;
	h3 {
		margin-top: 0.4rem;
	}
	details {
		margin-top: 1rem;
		margin-bottom: 0.4rem;
	}
`

const NodeList = ({ nodes, isOpenByDefault }) => {
	return (
		<NodeListWrapper>
			{nodes.map((f) => {
				const humanDistance = computeHumanDistance(f.distance * 1000)
				const oh = f.tags.opening_hours
				const { isOpen } = oh ? getOh(oh) : {}

				const roseDirection = computeRoseDirection(f.bearing)
				return (
					<li key={f.id}>
						{!isOpenByDefault &&
							(oh == null ? (
								<OpenIndicatorPlaceholder />
							) : (
								<OpenIndicator isOpen={isOpen === 'error' ? false : isOpen} />
							))}
						<FeatureLink feature={f} />{' '}
						<small>
							à {humanDistance[0]} {humanDistance[1]} vers {roseDirection}
						</small>
					</li>
				)
			})}
		</NodeListWrapper>
	)
}

const NodeListWrapper = styled.ul`
	margin-left: 0.2rem;
	list-style-type: none;
`

const OpenIndicatorPlaceholder = styled.span`
	display: inline-block;
	width: 1.8rem;
`

export const computeRoseDirection = (bearing) =>
	Math.abs(bearing) > 135
		? 'le sud'
		: Math.abs(bearing) < 45
		? 'le nord'
		: bearing < 0
		? "l'ouest"
		: "l'est"
