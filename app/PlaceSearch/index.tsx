'use client'

import GeoInputOptions from '@/components/GeoInputOptions'
import fetchPhoton from '@/components/fetchPhoton'
import { buildAddress } from '@/components/osm/buildAddress'
import ItineraryProposition, {
	AnimatedSearchProposition,
} from '@/components/placeSearch/ItineraryProposition'
import detectCodePostal from '@/components/placeSearch/detectCodePostal'
import detectCoordinates from '@/components/placeSearch/detectCoordinates'
import detectSmartItinerary from '@/components/placeSearch/detectSmartItinerary'
import { hasBboxShiftedSignificantly } from '@/components/mapUtils'
import {
	getArrayIndex,
	replaceArrayIndex,
	sortBy,
} from '@/components/utils/utils'
import { isIOS } from '@react-aria/utils'
import computeDistance from '@turf/distance'
import { styled } from 'next-yak'
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import QuickFeatureSearch from '../QuickFeatureSearch'
import { buildAllezPart, setAllezPart } from '../SetDestination'
import { encodePlace } from '../utils'
import { FromHereLink } from './_components/FromHereLink'
import { Geolocate } from './_components/Geolocate'
import LogoCarteApp from './_components/LogoCarteApp'
import SearchBar from './_components/SearchBar'
import SearchHereButton from './_components/SearchResults/SearchHereButton'
import SearchHistory from './_components/SearchResults/SearchHistory'
import SearchLoader from './_components/SearchResults/SearchLoader'
import SearchNoResults from './_components/SearchResults/SearchNoResults'
import SearchResultsContainer from './_components/SearchResults/SearchResultsContainer'
import useIcons from '../effects/useIcons'
import { NewsPlop } from '@/components/news/NewsPlop'

/* I'm  not sure of the interest to attache `results` to each state step.
 * It could be cached across the app. No need to re-query photon for identical
 * queries too.*/
export default function PlaceSearch({
	state,
	setState,
	sideSheet,
	setSnap,
	zoom,
	setSearchParams,
	searchParams,
	autoFocus = false,
	stepIndex,
	geolocation,
	placeholder,
	minimumQuickSearchZoom,
	vers,
	snap,
	quickSearchFeaturesMap,
	center,
	setChargement,
	bbox,
}) {
	console.log('lightgreen stepIndex', stepIndex, state)
	console.log('lightgreen autofocus', autoFocus)
	// This component stores its state in the... state array, hence needs an
	// index to store its current state in the right array index
	if (stepIndex == null) throw new Error('Step index necessary')

	const [isLocalSearch, setIsLocalSearch] = useState(true)
	const [searchHistory, setSearchHistory] = useLocalStorage(
		'searchHistory',
		[],
		{
			initializeWithValue: false,
		}
	)
	// is the user trying to enter an itinerary in the search box ?
	const [itineraryProposition, setItineraryProposition] = useState()
	// is the user trying to enter a French postal code in the search box ?
	const [postalCodeState, setPostalCodeState] = useState()
	// is the user trying to enter coordinates in the search box ?
	const [coordinatesState, setCoordinatesState] = useState()

	useEffect(() => {
		if (!coordinatesState) return

		const timeoutReference = setTimeout(() => setCoordinatesState(null), 4000)
		return () => {
			clearTimeout(timeoutReference)
		}
	}, [coordinatesState, setCoordinatesState])

	const urlSearchQuery = searchParams.q

	const step = getArrayIndex(state, stepIndex) || {
		results: [],
		inputValue: '',
	}
	const value = step.inputValue

	// hence this, but does it work with autofocus from triggered indirectly by
	// the Steps component ?
	const [isMyInputFocused, instantaneousSetIsMyInputFocused] = useState(false)

	//
	useEffect(() => {
		// the onClick below doesn't work on iOS, and this technique produces worse
		// results on Android Firefox and especially chrome
		if (!isIOS()) return
		if (!isMyInputFocused) return
		setSnap(0, 'PlaceSearch')
	}, [isMyInputFocused, setSnap])

	const setIsMyInputFocused = (value) => {
		// click on suggestion would close the suggestion before it works haha dunno
		// why
		setTimeout(() => instantaneousSetIsMyInputFocused(value), 300)
	}

	const centerLatLon = [...center].reverse()
	const localSearch = isLocalSearch && centerLatLon

	// Should this function be coded as a useCallback ? I get an infinite loop
	const onInputChange =
		(stepIndex = -1) =>
		(searchValue) => {
			setItineraryProposition(null)
			detectSmartItinerary(searchValue, localSearch, zoom, (result) => {
				if (result == null) return
				const [from, to] = result
				setItineraryProposition([from, to])
			})

			detectCoordinates(
				searchValue,
				localSearch,
				zoom,
				([latitude, longitude]) => {
					setSearchParams({
						clic: latitude + '|' + longitude,
					})
					const newStateEntry = {}
					const newState = replaceArrayIndex(
						state,
						stepIndex,
						newStateEntry
						//validated: false, // TODO was important or not ? could be stored in each state array entries and calculated ?
					)

					setState(newState)
				},
				setCoordinatesState
			)

			detectCodePostal(
				searchValue,
				localSearch,
				zoom,
				(results) => {
					if (!results?.length) return
					console.log('indigo res', results)

					const osmElement = sortBy(
						({ lon, lat }) => -computeDistance(center, [lon, lat])
					)(results.filter((element) => element.type === 'relation'))[0]

					const centerId = osmElement.members.find(
						(element) => element.role === 'admin_centre'
					).ref

					const center = results.find((result) => result.id === centerId)

					const allez = buildAllezPart(
						osmElement.tags?.name,
						encodePlace(osmElement.type, osmElement.id),
						center.lon,
						center.lat
					)

					setSearchParams({ allez })
					setPostalCodeState(null)
					console.log('indigo', allez)
				},
				setPostalCodeState
			)

			const oldStateEntry = state[stepIndex]
			const stateEntry = {
				...(oldStateEntry?.results?.length && searchValue == null
					? { results: null }
					: {}),
				...(searchValue === '' ? {} : { inputValue: searchValue }),
				stepBeingSearched: oldStateEntry?.stepBeingSearched,
				allezValue: oldStateEntry?.allezValue,
			}
			const safeStateEntry =
				Object.keys(stateEntry).length > 0 ? stateEntry : null

			console.log('will call replaceArrayIndex', state, stepIndex)
			const newState = replaceArrayIndex(
				state,
				stepIndex,
				safeStateEntry
				//validated: false, // TODO was important or not ? could be stored in each state array entries and calculated ?
			)

			setState(newState)
			if (searchValue?.length > 2) {
				fetchPhoton(
					searchValue,
					setState,
					stepIndex,
					localSearch,
					zoom,
					setSearchParams
				)
			}
		}

	// Store previous bbox for comparison and initialize it with the current bbox
	const [prevBbox, setPrevBbox] = useState(bbox || null)

	// Update prevBbox when component mounts or when bbox changes significantly
	useEffect(() => {
		if (bbox && !prevBbox) {
			setPrevBbox(bbox)
			console.log('Initializing prevBbox with', bbox)
		}
	}, [bbox, prevBbox])

	const safeZoom = isLocalSearch ? zoom : false
	const bboxSignature = bbox ? bbox.join(',') : ''

	useEffect(() => {
		if (value == undefined) return
		onInputChange(stepIndex)(value)
	}, [isLocalSearch, stepIndex, value, safeZoom])

	useEffect(() => {
		if (!bbox) return

		// Only check for significant shift if we have both current and previous bbox
		const shouldRefetch =
			prevBbox && hasBboxShiftedSignificantly(bbox, prevBbox)
		console.log({ shouldRefetch, bbox, prevBbox, bboxSignature })

		if (shouldRefetch) {
			console.log('Bbox shifted significantly, refetching results')
			setPrevBbox(bbox)
			onInputChange(stepIndex)(value)
		}
	}, [bboxSignature, bbox, prevBbox])

	const onDestinationChange = onInputChange(stepIndex)

	useEffect(() => {
		if (!urlSearchQuery || value) return

		onDestinationChange(urlSearchQuery)
		setTimeout(() => {
			setSearchParams({ q: undefined })
		}, 2000)
	}, [urlSearchQuery, onDestinationChange, value])

	const shouldShowHistory =
		(step.inputValue == null || step.inputValue === '') &&
		isMyInputFocused &&
		searchHistory.length > 0

	const shouldShowResults =
		step.inputValue !== '' &&
		(!step.choice || step.choice.inputValue !== step.inputValue)

	const isLoading =
		!step.results && step.inputValue != null && step.inputValue?.length >= 3

	const icons = useIcons()

	const aboutLink = setSearchParams({ intro: !searchParams.intro }, true)
	return (
		<div>
			<LogoWrapper $sideSheet={sideSheet}>
				<NewsPlop
					href={aboutLink}
					title="Découvrez les dernières améliorations de Cartes.app"
				/>
				<LogoCarteApp link={aboutLink} />
				<SearchBar
					state={state}
					value={value}
					onDestinationChange={onDestinationChange}
					setIsMyInputFocused={setIsMyInputFocused}
					setSnap={setSnap}
					placeholder={placeholder}
					autofocus={autoFocus}
				/>
			</LogoWrapper>
			<div>
				{(!value || value.length === 0) &&
					state.length > 1 &&
					(geolocation ? (
						<FromHereLink
							geolocation={geolocation}
							searchParams={searchParams}
							state={state}
						/>
					) : (
						<Geolocate being={searchParams.geoloc} />
					))}
			</div>
			{shouldShowHistory && (
				<SearchHistory
					onDestinationChange={onDestinationChange}
					searchHistory={searchHistory}
					setSearchHistory={setSearchHistory}
					sideSheet={sideSheet}
				/>
			)}

			{itineraryProposition && (
				<ItineraryProposition
					data={itineraryProposition}
					setSearchParams={setSearchParams}
				/>
			)}

			{postalCodeState && (
				<AnimatedSearchProposition>{postalCodeState}</AnimatedSearchProposition>
			)}
			{coordinatesState && (
				<AnimatedSearchProposition>
					{coordinatesState}
				</AnimatedSearchProposition>
			)}

			{zoom > minimumQuickSearchZoom && (
				<QuickFeatureSearch
					{...{
						searchParams,
						searchInput: vers?.inputValue,
						setSnap,
						snap,
						quickSearchFeaturesMap,
						center,
					}}
				/>
			)}
			{shouldShowResults && (
				<div>
					{step.results && (
						<SearchResultsContainer $sideSheet={sideSheet}>
							{step.results.length > 0 ? (
								<GeoInputOptions
									{...{
										whichInput: 'vers', // legacy
										data: step,
										updateState: (newData) => {
											setSnap(1, 'PlaceSearch')
											// this is questionable; see first comment in this file
											const newState = replaceArrayIndex(
												state,
												stepIndex,
												newData
											)
											setState(newState)
											setSearchHistory([
												value,
												...searchHistory.filter((entry) => entry !== value),
											])

											console.log('ici', newData)
											const { osmId, featureType, longitude, latitude, name } =
												newData.choice

											setChargement({
												osmCode: encodePlace(featureType, osmId),
												name,
											})

											const address = buildAddress(newData.choice, true)
											const isOsmFeature = osmId && featureType
											setSearchParams({
												allez: setAllezPart(
													stepIndex,
													newState,
													buildAllezPart(
														name || address,
														isOsmFeature ? encodePlace(featureType, osmId) : '',
														longitude,
														latitude
													)
												),
												q: undefined,
											})
										},
										icons,
									}}
								/>
							) : (
								<SearchNoResults value={value} />
							)}
							<SearchHereButton
								setIsLocalSearch={setIsLocalSearch}
								isLocalSearch={isLocalSearch}
								state={state}
								stepIndex={stepIndex}
							/>
						</SearchResultsContainer>
					)}
					{isLoading && <SearchLoader />}
				</div>
			)}
		</div>
	)
}

const LogoWrapper = styled.div`
	display: flex;
	justify-content: start;
	align-items: center;
	margin-bottom: 0.4rem;
	position: relative;

	> a {
		margin: 0;
		padding: 0;
		margin-right: 0.4rem;
		> img {
			width: 2rem;
			height: auto;
			vertical-align: middle;
		}
	}
	margin-top: 0.2rem;
	${({ $sideSheet }) => $sideSheet && `margin: .4rem 0`}
`
