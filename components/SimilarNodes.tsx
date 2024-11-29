 import { computeHumanDistance } from '@/app/RouteRésumé'
 import { buildAllezPart } from '@/app/SetDestination'
 import categories from '@/app/categories.yaml'
 import moreCategories from '@/app/moreCategories.yaml'
 import useOverpassRequest from '@/app/effects/useOverpassRequest'
 import { encodePlace } from '@/app/utils'
 import turfDistance from '@turf/distance'
 import Link from 'next/link'
 import useSetSearchParams from './useSetSearchParams'
 import { capitalise0, sortBy } from './utils/utils'
 import { OpenIndicator, getOh } from '@/app/osm/OpeningHours'
 import { categoryIconUrl } from '@/app/QuickFeatureSearch'
 import { bearing } from '@turf/bearing'
 
 // This is very scientific haha
 const latDifferenceOfRennes = 0.07,
 	lonDifferenceOfRennes = 0.15,
 	latDiff = latDifferenceOfRennes / 2,
 	lonDiff = lonDifferenceOfRennes / 2
 // 48.07729814876498,-1.7461581764997334,48.148123804291316,-1.5894174840209132
 /* compute km2 to check
 	const earthRadius = 6371008.8
 	const [south, west, north, east] = bbox
 
 	const surface =
 		(earthRadius *
 			earthRadius *
 			Math.PI *
 			Math.abs(Math.sin(rad(south)) - Math.sin(rad(north))) *
 			(east - west)) /
 		180
 
 	// rad is:
 	function rad(num) {
 		return (num * Math.PI) / 180
 	}
 	*/
 
 const allCategories = [...categories, ...moreCategories]
 
 export default function SimilarNodes({ node }) {
 	const { tags } = node
 
 	const setSearchParams = useSetSearchParams()
 
 	const category = allCategories.find(({ query: queryRaw }) => {
 		const query = Array.isArray(queryRaw) ? queryRaw : [queryRaw]
 
 		return query.every((queryLine) => {
 			return Object.entries(tags).find(
 				([k, v]) => queryLine.includes(k) && queryLine.includes(v)
 			)
 		})
 	})
 
 	const { lat, lon } = node
 	const bbox = [
 		lat - latDiff / 2,
 		lon - lonDiff / 2,
 		lat + latDiff / 2,
 		lon + lonDiff / 2,
 	]
 
 	const [quickSearchFeaturesMap] = useOverpassRequest(
 		bbox,
 		category ? [category] : []
 	)
 	const features = category && quickSearchFeaturesMap[category.name]
 
 	if (!category || !features?.length) return
 
 	const reference = [lon, lat]
 	const featuresWithDistance =
 		features &&
 		features
 			.filter((feature) => feature.id !== node.id && feature.tags.name)
 			.map((feature) => {
 				const { lon: lon2, lat: lat2 } = feature
 				return {
 					...feature,
 					distance: turfDistance([lon2, lat2], reference),
 					bearing: bearing(reference, [lon2, lat2]),
 				}
 			})
 
 	const closestFeatures =
 		features && sortBy(({ distance }) => distance)(featuresWithDistance)
 	console.log('node', closestFeatures)
 	/*
 	 * Trouver la catégorie du lieu
 	 * lancer une requête Overpass pour les éléments similaires autour
 	 * afficher les plus proches surtout pour le SEO dans un premier temps, puis graphiquement
 	 * comme des cartes sur google dans un second temps
 	 * mettre un lien vers la recherche category=
 	 * ajouter une liste de résultats à la recherche par catégorie
 	 *
 	 * */
 
 	const title = category.title || capitalise0(category.name)
 	const isOpenByDefault = category['open by default']
 	const imageUrl = categoryIconUrl(category)
 	return (
 		<section
 			css={css`
 				margin-top: 2rem;
 				background: white;
 				border: 1px solid var(--lightestColor);
 				border-radius: 0.4rem;
 				padding: 0.3rem 0.8rem;
 				h3 {
 					margin-top: 0.4rem;
 				}
 			`}
 		>
 			{closestFeatures && (
 				<>
 					{' '}
 					<h3>{title} proches :</h3>
 					<NodeList
 						nodes={closestFeatures.slice(0, 10)}
 						setSearchParams={setSearchParams}
 						isOpenByDefault={isOpenByDefault}
 					/>
 					<details
 						css={css`
 							margin-top: 1rem;
 							margin-bottom: 0.4rem;
 						`}
 					>
 						<summary>Tous les {title} proches</summary>
 						<NodeList
 							nodes={closestFeatures.slice(10)}
 							setSearchParams={setSearchParams}
 							isOpenByDefault={isOpenByDefault}
 						/>
 					</details>
 				</>
 			)}
 		</section>
 	)
 }
 
 const NodeList = ({ nodes, setSearchParams, isOpenByDefault }) => (
 	<ul
 		css={css`
 			margin-left: 0.2rem;
 			list-style-type: none;
 		`}
 	>
 		{nodes.map((f) => {
 			const humanDistance = computeHumanDistance(f.distance * 1000)
 			const oh = f.tags.opening_hours
 			const { isOpen } = oh ? getOh(oh) : {}
 
 			const roseDirection = computeRoseDirection(f.bearing)
 			return (
 				<li key={f.id}>
 					{!isOpenByDefault &&
 						(oh == null ? (
 							<span
 								css={css`
 									display: inline-block;
 									width: 1.8rem;
 								`}
 							></span>
 						) : (
 							<OpenIndicator isOpen={isOpen === 'error' ? false : isOpen} />
 						))}
 					<Link
 						href={setSearchParams(
 							{
 								allez: buildAllezPart(
 									f.tags.name,
 									encodePlace(f.type, f.id),
 									f.lon,
 									f.lat
 								),
 							},
 							true
 						)}
 					>
 						{f.tags.name}
 					</Link>{' '}
 					<small>
 						à {humanDistance[0]} {humanDistance[1]} vers {roseDirection}
 					</small>
 				</li>
 			)
 		})}
 	</ul>
 )
 
 export const computeRoseDirection = (bearing) =>
 	Math.abs(bearing) > 135
 		? 'le sud'
 		: Math.abs(bearing) < 45
 		? 'le nord'
 		: bearing < 0
 		? "l'ouest"
 		: "l'est"
