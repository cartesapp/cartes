import categoryColors from '@/app/categoryColors.yaml'
import { uncapitalise0 } from '@/components/utils/utils'
import { css, styled } from 'next-yak'
import Image from 'next/image'
import Link from 'next/link'
import { exactThreshold } from './QuickFeatureSearch'
import { goldCladding } from './QuickFeatureSearchUI'
import { useEffect, useState } from 'react'

export default function MoreCategories({
	getNewSearchParamsLink,
	categoriesSet,
	filteredMoreCategories,
	doFilter,
}) {
	const [bulkImages, setBulkImages] = useState({})

	const groups = filteredMoreCategories.reduce((memo, next) => {
		return {
			...memo,
			[next.category]: [...(memo[next.category] || []), next],
		}
	}, {})

	useEffect(() => {
		const doFetch = async () => {
			const request = await fetch('/svgo/bulk')
			const json = await request.json()

			setBulkImages(Object.fromEntries(json))
		}
		doFetch()
	}, [setBulkImages])

	return (
		<Wrapper>
			<ol>
				{Object.entries(groups).map(([group, categories]) => {
					const groupColor = categoryColors[group]
					return (
						<Group key={group} $groupColor={groupColor}>
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
												<MapIcon
													category={category}
													color={groupColor}
													bulkImages={bulkImages}
												/>{' '}
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
		margin-top: ${(p) => (p.$doFilter ? `0.6rem` : '0')};
	}
	ol,
	ul {
		list-style-type: none;
	}
	ol {
		max-width: 100%;
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
			padding: 0rem 0.3rem;
			line-height: 1.5rem;
			border-radius: 0.2rem;
			background: white;
			border: 2px solid var(--lighterColor);
			white-space: nowrap;

			a {
				text-decoration: none;
				color: inherit;
				img {
					margin-right: 0.05rem;
				}
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
			? css`
					background: var(--lighterColor) !important;
					border-color: var(--darkColor) !important;
			  `
			: ''}
`
const MapIcon = ({ category, color, bulkImages }) => {
	const src = bulkImages[category['icon alias'] || category['icon']]

	const alt = 'Icône de la catégorie ' + (category.title || category.name)

	if (src) return <MapIconImage src={src} alt={alt} width="10" height="10" />
}

const MapIconImage = styled(Image)`
	width: 1.1rem;
	height: 1.1rem;
	vertical-align: sub;
	margin-bottom: 0.05rem;
`
