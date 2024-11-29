 import GeoInputOptions from '@/components/GeoInputOptions'
 import fetchPhoton from '@/components/fetchPhoton'
 import { buildAddress } from '@/components/osm/buildAddress'
 import ItineraryProposition, {
 	AnimatedSearchProposition,
 } from '@/components/placeSearch/ItineraryProposition'
 import detectCodePostal from '@/components/placeSearch/detectCodePostal'
 import detectCoordinates from '@/components/placeSearch/detectCoordinates'
 import detectSmartItinerary from '@/components/placeSearch/detectSmartItinerary'
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
 	const [itineraryProposition, setItineraryProposition] = useState()
 	const [postalCodeState, setPostalCodeState] = useState()
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
 
 	const [hash, setHash] = useState(null)
 
 	useEffect(() => {
 		setHash(window.location.hash)
 	}, [searchParams])
 
 	const local = hash && hash.split('/').slice(1, 3),
 		localSearch = isLocalSearch && local
 
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
 
 					const osmFeature = sortBy(
 						({ lon, lat }) => -computeDistance([local[1], local[0]], [lon, lat])
 					)(results.filter((element) => element.type === 'relation'))[0]
 
 					const centerId = osmFeature.members.find(
 						(element) => element.role === 'admin_centre'
 					).ref
 
 					const center = results.find((result) => result.id === centerId)
 
 					console.log('indigo res', osmFeature, center)
 
 					const allez = buildAllezPart(
 						osmFeature.tags?.name,
 						encodePlace(osmFeature.type, osmFeature.id),
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
 				key: oldStateEntry?.key,
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
 
 	const safeLocal = local ? local.join('') : false
 	useEffect(() => {
 		if (value == undefined) return
 		onInputChange(stepIndex)(value)
 	}, [isLocalSearch, stepIndex, value, zoom, safeLocal])
 
 	const onDestinationChange = onInputChange(stepIndex)
 
 	useEffect(() => {
 		if (!urlSearchQuery || value) return
 
 		onDestinationChange(urlSearchQuery)
 	}, [urlSearchQuery, onDestinationChange, value])
 
 	const shouldShowHistory =
 		step.inputValue === '' && isMyInputFocused && searchHistory.length > 0
 
 	const shouldShowResults =
 		step.inputValue !== '' &&
 		(!step.choice || step.choice.inputValue !== step.inputValue)
 
 	const isLoading =
 		!step.results && step.inputValue != null && step.inputValue?.length >= 3
 
 	return (
 		<div>
 			<LogoWrapper $sideSheet={sideSheet}>
 				<LogoCarteApp />
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
 				{state.length > 1 &&
 					stepIndex === 0 && // TODO for VIA geolocal, less prioritary
 					(geolocation ? (
 						<FromHereLink
 							geolocation={geolocation}
 							searchParams={searchParams}
 						/>
 					) : (
 						<Geolocate />
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
 	justify-content: center;
 	align-items: center;
 	margin-bottom: 0.4rem;
 
 	> button {
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
