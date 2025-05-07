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

export default function CategoryResults({
	resultsEntries,
	center,
	annuaireMode,
}) {
	const setSearchParams = useSetSearchParams()
	const resultsWithoutOrder = resultsEntries
			.map(([k, list]) =>
				(list || []).map((v) => ({
					...v,
					category: categories.find((cat) => cat.name === k),
				}))
			)
			.flat()
			//			.filter((feature) => feature.tags.name)
			.map((feature) => {
				const { coordinates } = feature.center.geometry
				return {
					...feature,
					distance: turfDistance(coordinates, center),
					bearing: bearing(center, coordinates),
				}
			}),
		results = sortBy((result) => result.distance)(resultsWithoutOrder)
	if (!results.length) return null
	return (
		<Section>
			<ResultsSummary>
				<div>
					{resultsEntries.map(([k, v], i) => (
						<div key={k}>
							<span>
								<span>{v.length}</span> <span>{k.toLowerCase()}</span>
							</span>
							{i < resultsEntries.length - 1 && ', '}
						</div>
					))}
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
	> div > span {
		color: #666;
		font-size: 90%;
	}
	img {
		width: 0.9rem;
		height: auto;
	}
`
