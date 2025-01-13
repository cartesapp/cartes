import { area, bboxPolygon } from '@turf/turf'
import { styled } from 'next-yak'

export const defaultAgencyFilter = 'urbain'
// these are filter functions that select lines depending on properties
// then, another function will adapt to keep only the points where filtered
// routes pass

export const getAgencyFilter = (keyTest) =>
	agencyFilters.find(([key]) => keyTest(key))[1]

export const agencyFilters = [
	[
		'urbain',

		{
			filter: (agency) => {
				const { routeTypeStats: stats, bbox } = agency
				const areaKm2 = area(bboxPolygon(bbox)) / 1000000
				console.log('routeTypeStats', agency, areaKm2)
				// because flixbus has route type 3, this old attribute does not
				// distinguish local buses and long range buses, what a bad decision
				// Nice, id fr-nicelignes-d-azur is huge though, more than 3000, so we
				// set this param just a bit higher
				if (areaKm2 > 3300) return

				return sumOfRouteTypes([3, 1, 0], stats) > 0.8
			},
		},
	],
	[
		'train',
		{
			filter: (agency) => agency.routeTypeStats[2] > 0.7, // SNCF has .79 train
		},
	],
	[
		'car',
		{
			filter: (agency) => {
				const { routeTypeStats: stats, bbox } = agency
				// example taken from PENNARBED
				console.log(
					'orange agency car stats',
					agency,
					sumOfRouteTypes(['2xx'], stats)
				)
				if (sumOfRouteTypes(['2xx', 715], stats) > 0.7) return true

				const areaKm2 = area(bboxPolygon(bbox)) / 1000000
				// because flixbus has route type 3, this old attribute does not
				// distinguish local buses and long range buses, what a bad decision
				if (areaKm2 < 3000) return

				return stats[3] > 0.7
			},
		},
	],
]

const sumOfRouteTypes = (types, stats) =>
	types.reduce((memo, next) => {
		if (typeof next === 'string' && next.match(/\dxx/)) {
			const sum = Object.entries(stats)
				.filter(([key, value]) => key >= 100 && ('' + key).startsWith(+next[0]))
				.reduce((memo2, [_, next2]) => memo2 + next2, 0)
			return sum + memo
		}
		return (stats[next] || 0) + memo
	}, 0)
export default function AgencyFilter({ agencyFilter, setAgencyFilter }) {
	return (
		<section>
			<AgencyFilterForm>
				{agencyFilters.map(([key]) => (
					<label
						key={key}
						style={{
							border: `2px solid ${
								key === agencyFilter ? `var(--darkColor)` : `var(--color)`
							}`,
						}}
					>
						<input
							type="checkbox"
							checked={agencyFilter === key}
							onChange={() => null}
							onClick={() => setAgencyFilter(key)}
						/>
						<span>{key}</span>
					</label>
				))}
			</AgencyFilterForm>
		</section>
	)
}

const AgencyFilterForm = styled.form`
	margin-top: 1rem;
	width: 100%;
	overflow: scroll;
	height: 3rem;
	label {
		margin: 0.6rem;
		white-space: nowrap;
		cursor: pointer;
		background: var(--color);
		color: white;
		padding: 0 0.6rem;
		line-height: 1.5rem;
		border-radius: 0.3rem;
		display: inline-flex;
		align-items: center;
		text-transform: uppercase;
		font-weight: 300;
		font-size: 90%;
	}
	input {
		margin-right: 0.4rem;
		border: 2px solid var(--darkColor);
		background: white;
		border-radius: 3px;
		appearance: none;
		width: 0.9rem;
		height: 0.9rem;
		margin-bottom: -0.05rem;
		&:checked {
			background: var(--darkColor);
			border: 2px solid var(--lightestColor);
		}
	}
`
