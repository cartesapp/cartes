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

export default function CategoryResults({ resultsEntries, center }) {
	const setSearchParams = useSetSearchParams()
	const resultsWithoutOrder = resultsEntries
			.map(([k, list]) =>
				list.map((v) => ({
					...v,
					category: categories.find((cat) => cat.name === k),
				}))
			)
			.flat()
			.filter((feature) => feature.tags.name)
			.map((feature) => {
				const { lon: lon2, lat: lat2 } = feature
				return {
					...feature,
					distance: turfDistance([lon2, lat2], center),
					bearing: bearing(center, [lon2, lat2]),
				}
			}),
		results = sortBy((result) => result.distance)(resultsWithoutOrder)
	return (
		<section>
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
						key={result.id}
						result={result}
						setSearchParams={setSearchParams}
					/>
				))}
			</ol>
		</section>
	)
}

const ResultsSummary = styled.div`
	display: flex;
	justify-content: space-between;
	margin-left: 0.2rem;
	> div > div > span {
		color: #666;
		font-size: 90%;
	}
	img {
		width: 0.9rem;
		height: auto;
	}
`
