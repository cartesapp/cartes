import { capitalise0, sortBy } from '@/components/utils/utils'
import { styled } from 'next-yak'

export const defaultTransitFilter = 'plan général'
// these are filter functions that select lines depending on properties
// then, another function will adapt to keep only the points where filtered
// routes pass

export const getTransitFilter = (keyTest) =>
	transitFilters.find(([key]) => keyTest(key))[1]

export const getLinesSortedByFrequency = (lines) =>
	sortBy(({ properties }) => -properties.perDay)(lines)

export const transitFilters = [
	[
		'plan général',
		{
			filter: ({ properties: { isNight, isSchool } }) => !(isNight || isSchool),
		},
	],
	[
		'lignes principales',
		{
			filter: ({ properties: { isNight, isSchool, perDay } }) =>
				perDay / 10 >= 6 && !(isNight || isSchool),
		},
	],
	['bus de nuit', { filter: (data) => data.properties.isNight }],
	['bus scolaire', { filter: (data) => data.properties.isSchool }],
	['métro', { filter: (data) => data.properties.route_type === 1 }],
	['tram', { filter: (data) => data.properties.route_type === 0 }],
	[
		'tous les bus',
		{
			filter: (data) => data.properties.route_type === 3,
		},
	],
	//['tout', { filter: (data) => data }],
]
export default function TransitFilter({
	data,
	transitFilter,
	setTransitFilter,
}) {
	if (!data || !data.length) return null
	const features = data.map(([agencyId, { features }]) => features).flat()
	console.log('cornflowerblue data', data, features)
	const filtered = transitFilters.map(([key, { filter }]) => {
		const routes = features.filter(
			(feature) => feature?.geometry?.type === 'LineString'
		)
		const filtered = routes.filter(filter)
		const selectedRoutes = filtered.length

		return [key, selectedRoutes]
	})
	return (
		<section>
			<TransitFilterForm>
				{sortBy(([, num]) => num === 0)(filtered).map(
					([key, selectedRoutes]) => {
						return (
							<TransitFilterLabel key={key} $selectedRoutes={selectedRoutes}>
								<input
									type="radio"
									checked={key === transitFilter}
									onChange={() => null}
									onClick={() => setTransitFilter(key)}
								/>
								{capitalise0(key)} ({selectedRoutes})
							</TransitFilterLabel>
						)
					}
				)}
			</TransitFilterForm>
		</section>
	)
}

const TransitFilterLabel = styled.label`
	background: white;
	padding: 0 0.6rem 0.1rem 0.4rem;
	border-radius: 0.3rem;
	border: 1px solid var(--darkColor);
	color: var(--darkColor);
	cursor: pointer;
	${(p) => p.$selectedRoutes === 0 && ` color: gray`}
`

const TransitFilterForm = styled.form`
	margin-top: 1rem;
	width: 100%;
	overflow: scroll;
	height: 2.4rem;
	label {
		margin: 0.6rem;
		white-space: nowrap;
	}
	input {
		margin-right: 0.4rem;
	}
`
