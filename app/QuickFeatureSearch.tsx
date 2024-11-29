import { categorySeparator, getCategories } from '@/components/categories'
import CategoryResults from '@/components/categories/CategoryResults'
import useSetSearchParams from '@/components/useSetSearchParams'
import { omit } from '@/components/utils/utils'
import Fuse from 'fuse.js/basic'
import { css } from 'next-yak'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import MoreCategories from './MoreCategories'
import {
	FeatureList,
	FeatureListWrapper,
	QuickSearchElement,
	SpinningDiscBorder,
} from './QuickFeatureSearchUI'
import categories from './categories.yaml'
import moreCategories from './moreCategories.yaml'

export const categoryIconUrl = (category) => {
	if (!category.icon)
		throw new Error(
			'Chaque catégorie doit fournir une icône au format suivant (voir le code)'
		)
	const url = category.icon.startsWith('http')
		? category.icon
		: '/icons/' + category.icon + '.svg'
	return url
}

export function initializeFuse(categories) {
	return new Fuse(categories, {
		keys: ['name', 'title', 'query', 'dictionary'],
		includeScore: true,
	})
}

const fuse = initializeFuse(categories)
const fuseMore = initializeFuse(moreCategories)
export const threshold = 0.02
export const exactThreshold = 0.005

export default function QuickFeatureSearch({
	searchParams,
	searchInput,
	setSnap,
	snap,
	quickSearchFeaturesMap,
	center,
}) {
	const [categoriesSet] = getCategories(searchParams)
	console.log('indigo t', categoriesSet)
	const [showMore, setShowMore] = useState(false)
	const hasLieu = searchParams.allez
	const setSearchParams = useSetSearchParams()
	const doFilter = !hasLieu && searchInput?.length > 2
	const filteredCategories = useMemo(
		() =>
			doFilter
				? fuse
						.search(searchInput)
						.filter((el) => el.score < threshold)
						.map((el) => ({
							...categories[el.refIndex],
							score: el.score,
						}))
				: categories,

		[searchInput, hasLieu]
	)
	const filteredMoreCategories = useMemo(
		() =>
			doFilter
				? fuseMore
						.search(searchInput)
						.filter((el) => el.score < threshold)
						.map((el) => ({
							...moreCategories[el.refIndex],
							score: el.score,
						}))
				: moreCategories,

		[searchInput, hasLieu]
	)
	console.log(
		'cat score',
		filteredCategories.map((el) => el.name + el.score),
		filteredMoreCategories.map((el) => el.name + el.score)
	)

	const getNewSearchParamsLink = buildGetNewSearchParams(
		searchParams,
		setSearchParams
	)
	return (
		<div
			css={css`
				margin-top: 0.8rem;
				> div {
					display: flex;
					align-items: center;
				}
			`}
		>
			<div>
				<FeatureListWrapper>
					<FeatureList $showMore={showMore}>
						{!doFilter && (
							<>
								<QuickSearchElement
									key="photos"
									{...{
										$clicked: searchParams.photos != null,
									}}
								>
									<Link
										href={setSearchParams(
											{
												...omit(['photos'], searchParams),
												...(searchParams.photos ? {} : { photos: 'oui' }),
											},
											true,
											true
										)}
									>
										<img src={'/icons/photo.svg'} />
									</Link>
								</QuickSearchElement>
							</>
						)}
						{filteredCategories.map((category) => {
							const active = categoriesSet.includes(category.name)
							return (
								<QuickSearchElement
									key={category.name}
									title={category.title || category.name}
									{...{
										$clicked: active,
										$setGoldCladding: category.score < exactThreshold,
									}}
								>
									{active && !quickSearchFeaturesMap[category.name] && (
										<SpinningDiscBorder />
									)}
									<Link
										href={getNewSearchParamsLink(category)}
										replace={false}
										prefetch={false}
									>
										<img src={categoryIconUrl(category)} />
									</Link>
								</QuickSearchElement>
							)
						})}
					</FeatureList>
				</FeatureListWrapper>
				{!doFilter && (
					<QuickSearchElement
						{...{
							$clicked: showMore,
							$background: 'var(--darkerColor)',
							$filter: showMore ? '' : 'invert(1)',
						}}
					>
						<button
							onClick={() => {
								if (snap > 1) setSnap(1, 'QuickFeatureSearch')
								setShowMore(!showMore)
							}}
						>
							<Image
								src={'/icons/more.svg'}
								width="10"
								height="10"
								alt="Voir plus de catégories de recherche"
							/>
						</button>
					</QuickSearchElement>
				)}
			</div>
			{(showMore || (doFilter && filteredMoreCategories.length > 0)) && (
				<MoreCategories
					getNewSearchParamsLink={getNewSearchParamsLink}
					categoriesSet={categoriesSet}
					filteredMoreCategories={filteredMoreCategories}
					doFilter={doFilter}
				/>
			)}
			<CategoryResults
				center={center}
				resultsEntries={Object.entries(quickSearchFeaturesMap).filter(
					([k, v]) => categoriesSet.includes(k)
				)}
			/>
		</div>
	)
}

const buildGetNewSearchParams =
	(searchParams, setSearchParams) => (category) => {
		const [categories] = getCategories(searchParams)
		const nextCategories = categories.includes(category.name)
			? categories.filter((c) => c !== category.name)
			: [...categories, category.name]

		const newSearchParams = {
			cat: nextCategories.length
				? nextCategories.join(categorySeparator)
				: undefined,
		}
		return setSearchParams(newSearchParams, true, true)
	}
