import { uncapitalise0 } from '@/components/utils/utils'
import Link from 'next/link'
import { exactThreshold } from './QuickFeatureSearch'
import { goldCladding } from './QuickFeatureSearchUI'
import categoryColors from '@/app/categoryColors.yaml'
import { styled, css } from 'next-yak'

export default function MoreCategories({
	getNewSearchParamsLink,
	categoriesSet,
	filteredMoreCategories,
	doFilter,
}) {
	const groups = filteredMoreCategories.reduce((memo, next) => {
		return {
			...memo,
			[next.category]: [...(memo[next.category] || []), next],
		}
	}, {})
	return (
		<Wrapper>
			<ol>
				{Object.entries(groups).map(([group, categories]) => {
					const groupColor = categoryColors[group]
					return (
						<Group key={group}>
							<h2>{group}</h2>
							<div>
								<ul>
									{categories.map((category) => (
										<Category
											key={category.name}
											$active={categoriesSet.includes(category.name)}
											$isExact={category.score < exactThreshold}
										>
											<Link href={getNewSearchParamsLink(category)}>
												{uncapitalise0(category.title || category.name)}
											</Link>
										</Category>
									))}
								</ul>
							</div>
						</Group>
					)
				})}
			</ol>
		</Wrapper>
	)
}

const Wrapper = styled.div`
	margin-bottom: 0.6rem;
	@media (max-width: 800px) {
		${(p) =>
			p.$doFilter
				? `margin-top: .6rem;`
				: `
 					margin-bottom: 50vh;
 					`}
	}
	ol,
	ul {
		list-style-type: none;
	}
	ol > li > div {
		overflow-x: scroll;
		white-space: nowrap;
		scrollbar-width: none;
		width: 100%;
	}
	ul {
		display: flex;
		align-items: center;

		/* Touch devices can scroll horizontally, desktop devices (hover:hover) cannot */
		@media (hover: hover) {
			flex-wrap: wrap;
		}
		li {
			margin: 0.2rem 0.2rem;
			padding: 0rem 0.4rem;
			line-height: 1.5rem;
			border-radius: 0.2rem;
			background: white;
			border: 2px solid var(--lighterColor);
			white-space: nowrap;

			a {
				text-decoration: none;
				color: inherit;
			}
		}
	}
	h2 {
		font-size: 75%;
		font-weight: 600;
		text-transform: uppercase;
		margin: 0.4rem 0 0.1rem 0;
		line-height: initial;
		color: var(--darkerColor);
	}
`
const Group = styled.li`
	border-left: 4px solid ${(p) => p.$groupColor};
	padding-left: 0.4rem;
`

const Category = styled.li`
	${(p) => (p.$isExact ? goldCladding : '')}

	${(p) =>
		p.$active
			? `
 background: var(--lighterColor) !important;
 border-color: var(--darkColor) !important;

 `
			: ''}
`
