'use client'
import {
	categorySeparator,
	filteredMoreCategories,
	getCategories,
} from '@/components/categories'
import CategoryResults from '@/components/categories/CategoryResults'
import categoryIconUrl from '@/components/categoryIconUrl'
import useSetSearchParams from '@/components/useSetSearchParams'
import { omit } from '@/components/utils/utils'
import Fuse from 'fuse.js/basic'
import { css } from 'next-yak'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import MoreCategories from './MoreCategories'
import {
	FeatureList,
	FeatureListWrapper,
	QuickSearchElement,
	QuickSearchElementDiv,
	SpinningDiscBorder,
} from './QuickFeatureSearchUI'
import categories from './categories.yaml'
const moreCategories = filteredMoreCategories

export function initializeFuse(categories) {
	return new Fuse(categories, {
		keys: ['name', 'query', 'dictionary'],
		includeScore: true,
		ignoreLocation: true,
		ignoreDiacritics: true,
	})
}

const fuse = initializeFuse(categories)
const fuseMore = initializeFuse(moreCategories)
export const threshold = 0.02
export const exactThreshold = 0.005

export default function QuickFeatureSearch({
	searchParams,
	searchInput,
	setSnap = () => null,
	snap,
	quickSearchFeaturesMap,
	center,
	noPhotos = false,
	annuaireMode = false,
}) {
	// get the list of category keys matching the parameters in the URL = active categories
	const [activeCategoryKeys, activeCategories] = getCategories(searchParams)

	const showMore = searchParams['cat-plus']
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

	const getNewSearchParamsLink = buildGetNewSearchParams(
		searchParams,
		setSearchParams
	)

	// merge the results
	// returns an array with for each category : [String category key, Array category elements]
	const resultsEntries = Object.entries(quickSearchFeaturesMap).filter(
		([k, v]) => activeCategoryKeys.includes(k)
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
						{!doFilter && !noPhotos && (
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
							const active = activeCategoryKeys.includes(category.key)
							return (
								<QuickSearchElement
									key={category.key}
									name={category.name}
									{...{
										$clicked: active,
										$setGoldCladding: category.score < exactThreshold,
									}}
								>
									{active && !quickSearchFeaturesMap[category.name] && (
										<SpinningDiscBorder />
									)}
									<Link
										href={
											annuaireMode
												? setSearchParams({ cat: category.name }, true, true)
												: getNewSearchParamsLink(category)
										}
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
					<QuickSearchElementDiv
						{...{
							$clicked: showMore,
							$background: 'var(--darkerColor)',
							$filter: showMore ? '' : 'invert(1)',
						}}
					>
						<button
							onClick={() => {
								if (snap > 1) setSnap(1, 'QuickFeatureSearch')
								setSearchParams({
									'cat-plus':
										searchParams['cat-plus'] === 'oui' ? undefined : 'oui',
								})
							}}
						>
							<Image
								src={'/icons/more.svg'}
								width="10"
								height="10"
								alt="Voir plus de catégories de recherche"
							/>
						</button>
					</QuickSearchElementDiv>
				)}
			</div>
			{(showMore ||
				(doFilter && filteredMoreCategories.length > 0) ||
				(annuaireMode && !Object.keys(quickSearchFeaturesMap).length)) && (
				<MoreCategories
					getNewSearchParamsLink={getNewSearchParamsLink}
					activeCategoryKeys={activeCategoryKeys}
					filteredMoreCategories={filteredMoreCategories}
					doFilter={doFilter}
					annuaireMode={annuaireMode}
				/>
			)}

			{activeCategoryKeys.length > 0 && (
				<CategoryResults
					center={center}
					annuaireMode={annuaireMode}
					resultsEntries={resultsEntries}
				/>
			)}
		</div>
	)
}

/**
 * Add or remove a category from the URL parameters list
 */
const buildGetNewSearchParams =
	(searchParams, setSearchParams) => (category) => {
		// get the category keys matching the parameters in URL
		const [oldKeys] = getCategories(searchParams)
		// if new category already present, remove its key from the list, else add it to the list
		const newKeys = oldKeys.includes(category.key)
			? oldKeys.filter((c) => c !== category.key)
			: [...oldKeys, category.key]
		// build new list of search parameters
		const newSearchParams = {
			'cat-plus': searchParams['cat-plus'],
			cat: newKeys.length
				? newKeys.join(categorySeparator)
				: undefined,
		}
		// set the parameters in the URL
		return setSearchParams(newSearchParams, true, true)
	}
