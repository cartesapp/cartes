import closeIcon from '@/public/close.svg'
import { bearing } from '@turf/bearing'
import turfDistance from '@turf/distance'
import { styled } from 'next-yak'
import Image from 'next/image'
import Link from 'next/link'
import { categories } from '../categories'
import useSetSearchParams from '../useSetSearchParams'
import { sortBy } from '../utils/utils'
import CategoryResult from './CategoryResult'
import { uncapitalise0 } from '../utils/utils'

export default function CategoryResults({
	resultsEntries,
	center,
	annuaireMode,
}) {
	const setSearchParams = useSetSearchParams()

	//Build a merged list of all OSM elements (from all categories) ordered by distance
	// TODO : remove duplicates (same place found in 2 different categories) since it fires an error "2 children wiht the same key"
	const resultsWithoutOrder = resultsEntries
			.map(([k, list]) =>
				(list || []).map((v) => ({
					...v,
					// add the category to each OSM element
					category: categories.find((cat) => cat.key === k),
				}))
			)
			// merge all OSM elements in 1 array
			.flat()
			// calculate distance and bearing
			.map((feature) => {
				const { coordinates } = feature.center.geometry
				return {
					...feature,
					distance: turfDistance(coordinates, center),
					bearing: bearing(center, coordinates),
				}
			}),
		// sort the OSM elements by distance
		results = sortBy((result) => result.distance)(resultsWithoutOrder)

	//Display the list of OSM elements (merged and ordered)
	// TODO handle plurals in category names
	return (
		<Section>
			<ResultsSummary>
				<div>
					{resultsEntries.map(([k, v], i) => (
						<span key={k}>
							<span>
								<span>{v.length}</span> <span>{uncapitalise0(categories.find((c) => c.key == k).name)}</span>
							</span>
							{i < resultsEntries.length - 1 && ', '}
						</span>
					))}
					<span> trouvés dans cette zone.</span>
				</div>
				{resultsEntries.length > 0 && (
					<Link href={setSearchParams({ cat: undefined }, true)}>
						<Image src={closeIcon} alt="Fermer" />
					</Link>
				)}
			</ResultsSummary>
			<ol>
				{results.map((result) => (
					<CategoryResult
						annuaireMode={annuaireMode}
						key={result.osmCode}
						result={result}
						setSearchParams={setSearchParams}
					/>
				))}
			</ol>
		</Section>
	)
}
const Section = styled.section`
	@media (max-width: 800px) {
		margin-bottom: 50vh;
	}
`

const ResultsSummary = styled.div`
	display: flex;
	justify-content: space-between;
	margin-left: 0.2rem;
	margin-top: 0.4rem;
	> div > span {
		color: #666;
		font-size: 90%;
	}
	img {
		width: 0.9rem;
		height: auto;
		vertical-align: middle;
	}
`
