'use client'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { sortGares } from './gares'

import MapButtons from '@/components/MapButtons'
import { goodIconSize, useComputeMapPadding } from '@/components/mapUtils'
import useSetSearchParams from '@/components/useSetSearchParams'
import useAddMap, {
	defaultLight,
	defaultSky,
	globeLight,
	highZoomLight,
} from './effects/useAddMap'
import useDrawQuickSearchFeatures from './effects/useDrawQuickSearchFeatures'
import { getStyle } from './styles/styles'
import useHoverOnMapFeatures from './useHoverOnMapFeatures'
import useTerrainControl from './useTerrainControl'

import getBbox from '@turf/bbox'
import { useLocalStorage } from 'usehooks-ts'
import CenteredCross from './CenteredCross'
import MapComponents from './MapComponents'
import MapCompassArrow from './boussole/MapCompassArrow'
import { defaultState } from './defaultState'
import useDrawElectionClusterResults from './effects/useDrawElectionCluserResults'
import useDrawPanoramaxPosition, {
	useAddPanoramaxLayer,
} from './effects/useDrawPanoramaxPosition'
import useDrawSearchResults from './effects/useDrawSearchResults'
import useDrawTransport from './effects/useDrawTransport'
import useImageSearch from './effects/useImageSearch'
import useMapClick from './effects/useMapClick'
import useRightClick from './effects/useRightClick'
import useSearchLocalTransit from './effects/useSearchLocalTransit'
import useDrawItinerary from './itinerary/useDrawItinerary'
import { useWhatChanged } from '@/components/utils/useWhatChanged'
import { computeCenterFromBbox } from './utils'

if (process.env.NEXT_PUBLIC_MAPTILER == null) {
	throw new Error('You have to configure env NEXT_PUBLIC_MAPTILER, see README')
}

/*******
 * This component should hold only the hooks that depend on the map or are user
 * interactions. Components that can be rendered server side to make beautiful and useful meta previews of URLs must be written in the Container component or above
 *******/

export default function Map(props) {
	const {
		searchParams,
		state,
		vers,
		target,
		zoom,
		osmFeature,
		isTransportsMode,
		transportStopData,
		transportsData,
		agencyAreas,
		clickedStopData,
		itinerary,
		bikeRouteProfile,
		showOpenOnly,
		category,
		bbox,
		setBbox,
		gares,
		clickGare,
		clickedGare,
		setBboxImages,
		focusImage,
		styleKey,
		safeStyleKey,
		setSafeStyleKey,
		styleChooser,
		setStyleChooser,
		setZoom,
		setGeolocation,
		center,
		setState,
		setLatLngClicked,
		quickSearchFeatures,
		trackedSnap,
		panoramaxPosition,
		setMapLoaded,
		wikidata,
		setLastGeolocation,
		lastGeolocation,
	} = props
	useWhatChanged(props, 'Map')
	const mapContainerRef = useRef(null)
	const stepsLength = state.filter((step) => step?.key).length
	const [autoPitchPreference, setAutoPitchPreference] = useLocalStorage(
		'autoPitchPreference',
		null
	)

	const autoPitchPreferenceIsNo = autoPitchPreference === 'no'

	const style = useMemo(() => getStyle(styleKey), [styleKey]),
		styleUrl = style.url

	const [map, triggerGeolocation, geolocate] = useAddMap(
		styleUrl,
		setZoom,
		setBbox,
		mapContainerRef,
		setGeolocation,
		setMapLoaded,
		center,
		zoom
	)
	const setSearchParams = useSetSearchParams()

	const shouldGeolocate = searchParams.geoloc
	useEffect(() => {
		if (!map || !shouldGeolocate) return
		console.log('will trigger maplibregeolocate')
		triggerGeolocation()
		setSearchParams({ geoloc: undefined })
	}, [map, triggerGeolocation, shouldGeolocate, setSearchParams])

	const [distanceMode, setDistanceMode] = useState(false)

	const padding = useComputeMapPadding(trackedSnap, searchParams)

	useEffect(() => {
		if (!map) return

		map.flyTo({ padding })
	}, [map, padding])

	const wikidataPicture = wikidata?.pictureUrl

	const wikidataPictureObject = wikidataPicture &&
		osmFeature && {
			thumbnailUrl: wikidataPicture,
			title: wikidata.pictureName, //could be better
			fromWikidata: true,
			lat: osmFeature.lat,
			lon: osmFeature.lon,
		}

	useImageSearch(
		map,
		setBboxImages,
		zoom,
		bbox,
		searchParams.photos,
		focusImage,
		wikidataPictureObject
	)

	// TODO reactivate
	useSearchLocalTransit(map, isTransportsMode, center, zoom)

	const agencyId = searchParams.agence
	const agency = useMemo(() => {
		const agencyData =
			transportsData && transportsData.find((el) => el[0] === agencyId)
		return agencyData && { id: agencyData[0], ...agencyData[1] }
	}, [agencyId, transportsData]) // including transportsData provokes a loop : maplibre bbox updated -> transportsData recreated -> etc

	useEffect(() => {
		if (!map || !agency) return

		const bbox = agency.bbox

		const mapLibreBBox = [
			[bbox[0], bbox[1]],
			[bbox[2], bbox[3]],
		]
		map.fitBounds(mapLibreBBox, { padding })
	}, [map, agency])

	useDrawElectionClusterResults(map, styleKey, searchParams.filtre)

	const hasItinerary = stepsLength > 1

	useDrawTransport(
		map,
		clickedStopData[1]?.features,
		safeStyleKey,
		hasItinerary
	)

	useDrawItinerary(
		map,
		itinerary.isItineraryMode,
		searchParams,
		state,
		zoom,
		itinerary.routes,
		itinerary.date
	)

	const onSearchResultClick = (feature) => {
		setState([...state.slice(0, -1), defaultState.vers])
		//setOsmFeature(feature) old function, this call seems useless now
	}

	//TODO this hook should be used easily with some tweaks to draw the borders of
	// the clicked feature, and an icon
	// Edit : we draw contours now, for the search results clicked feature

	useDrawQuickSearchFeatures(
		map,
		quickSearchFeatures,
		showOpenOnly,
		category,
		onSearchResultClick
	)
	useDrawSearchResults(map, state, onSearchResultClick)

	useTerrainControl(map, style)

	useEffect(() => {
		if (!map) return
		if (Math.round(map.getZoom()) === zoom) return
		map.flyTo({ zoom })
	}, [zoom, map])

	const [lightType, setLightType] = useState('highZoom')
	useEffect(() => {
		if (!map) return
		map.on('zoom', () => {
			const approximativeZoom = Math.round(map.getZoom())
			if (approximativeZoom !== zoom) setZoom(approximativeZoom)
			setLastGeolocation({
				center: lastGeolocation.center,
				zoom: approximativeZoom,
			})

			if (approximativeZoom < 6 && lightType === 'highZoom') {
				setLightType('globeLight')
				map.setLight(globeLight)
			}
			if (approximativeZoom >= 6 && lightType === 'globeLight') {
				setLightType('highZoom')
				map.setLight(highZoomLight)
			}
		})
		map.on('moveend', () => {
			setBbox(map.getBounds().toArray())
			setLastGeolocation({
				center: computeCenterFromBbox(bbox),
				zoom: lastGeolocation.zoom,
			})
		})
	}, [zoom, setZoom, map, setBbox, setLightType, lightType])

	useEffect(() => {
		if (!map) return

		console.log('salut redraw')

		// diff seems to fail because of a undefined sprite error showed in the
		// console
		// hence this diff: false. We're not loosing much
		// UPDATE 26 april 2024, maplibre 4.1.3, seems to be working now, hence
		// diff: true :)
		const previousStyle = map.getStyle()
		console.log('previous', previousStyle)
		const shouldSetStyle =
			previousStyle && previousStyle.name !== (style.originalName || style.name)

		const onStyleLoad = () => {
			setSafeStyleKey(styleKey)
		}
		if (shouldSetStyle) {
			map.on('style.load', onStyleLoad)
			map.setSky() // Don't really know why, this saves use from having an ugly opaque layer on style change
			map.setStyle(styleUrl, { diff: false }) //setting styleKey!== 'base' doesn't work, probably because the error comes from switching from base to another ?
			//TODO the Oneway style in voyage style gets corrupted after switching to
			//transit or another style, hence this temporary disable diff
		} else {
			setSafeStyleKey(styleKey)
		}

		return () => {
			map.off('style.load', onStyleLoad)
		}
	}, [styleUrl, map, styleKey, setSafeStyleKey])

	useRightClick(map)

	useMapClick(
		map,
		state,
		distanceMode,
		itinerary,
		isTransportsMode,
		setLatLngClicked,
		gares,
		clickGare,
		setSearchParams,
		styleKey,
		searchParams['choix du style'] === 'oui'
	)

	useHoverOnMapFeatures(map)

	/*
	 *
	 * Fly to hook
	 *
	 * */
	useEffect(() => {
		if (!map || !vers || !osmFeature) return
		if (stepsLength > 1) return

		const tailoredZoom = //TODO should be defined by the feature's polygon if any
			/* ['city'].includes(vers.choice.type)
			? 12
			: */
			Math.max(15, zoom)
		console.log(
			'blue',
			'will fly to in after OSM download from vers marker',
			vers,
			tailoredZoom
		)
		if (osmFeature.polygon) {
			const bbox = getBbox(osmFeature.polygon)
			map.fitBounds(bbox, {
				maxZoom: 17.5, // We don't want to zoom at door level for a place, just at street level
			})
		} else {
			if (!autoPitchPreferenceIsNo)
				setAutoPitchPreference(Math.round(new Date().getTime() / 1000))
			const auto3d = !autoPitchPreferenceIsNo

			map.flyTo({
				center: [vers.longitude, vers.latitude],
				zoom: tailoredZoom,
				pitch: autoPitchPreferenceIsNo ? 0 : 40, // pitch in degrees
				bearing: autoPitchPreferenceIsNo ? 0 : 15, // bearing in degrees
				// speed and maxDuration could let us zoom less quickly between shops,
				// but then the animation from town to town wouldn't take place anymore.
				// This animation lets the user understand the direction of the move.
			})
		}
	}, [
		map,
		vers,
		osmFeature,
		stepsLength,
		autoPitchPreferenceIsNo,
		setAutoPitchPreference,
	])

	/* TODO Transform this to handle the last itinery point if alone (just a POI url),
	 * but also to add markers to all the steps of the itinerary */
	/* Should be merged with the creation of route markers
	useSetTargetMarkerAndZoom(
		map,
		target,
		state.vers.marker,
		state.vers.choice.type,
		setState,
		setLatLngClicked,
		zoom
	)
	*/

	/* Abandoned code that should be revived. Traveling with train + bike is an
	 * essential objective of Cartes */
	const lesGaresProches =
		target && gares && sortGares(gares, target).slice(0, 30)

	useEffect(() => {
		if (!lesGaresProches) return
		const markers = lesGaresProches.map((gare) => {
			const element = document.createElement('div')
			const factor = { 1: 0.9, 2: 1.1, 3: 1.3 }[gare.niveau] || 0.7
			element.style.cssText = `
				display: flex;
				flex-direction: column;
				align-items: center;
				cursor: help;
			`
			const size = goodIconSize(zoom, factor) + 'px'

			const image = document.createElement('img')
			image.src = '/gare.svg'
			image.style.width = size
			image.style.height = size
			image.alt = "Icône d'une gare"
			element.append(image)

			element.addEventListener('click', () => {
				clickGare(gare.uic === clickedGare?.uic ? null : gare.uic)
			})

			const marker = new maplibregl.Marker({ element })
				.setLngLat(gare.coordonnées)
				.addTo(map)
			return marker
		})
		return () => {
			markers.map((marker) => marker.remove())
		}
	}, [lesGaresProches, map, zoom, clickGare, clickedGare?.uic])

	useDrawPanoramaxPosition(map, panoramaxPosition)
	useAddPanoramaxLayer(
		map,
		searchParams.panoramax != null || searchParams.rue === 'oui',
		safeStyleKey
	)

	return (
		<>
			<MapButtons
				{...{
					style,
					setStyleChooser,
					styleChooser,
					distanceMode,
					setDistanceMode,
					map,
					itinerary,
					searchParams,
				}}
			/>
			{isTransportsMode && <CenteredCross />}
			<MapCompassArrow geolocate={geolocate} map={map} />
			{map && (
				<MapComponents
					{...{
						map,
						vers,
						transportsData,
						agencyAreas,
						isTransportsMode,
						safeStyleKey,
						searchParams,
						hasItinerary,
					}}
				/>
			)}
			<div
				ref={mapContainerRef}
				css={`
					.maplibregl-ctrl
						button.maplibregl-ctrl-compass
						.maplibregl-ctrl-icon {
						background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='29' height='29' fill='crimson' viewBox='0 0 29 29'%3E%3Cpath d='m10.5 14 4-8 4 8z'/%3E%3Cpath fill='%23ccc' d='m10.5 16 4 8 4-8z'/%3E%3C/svg%3E");
					}

					@media (max-width: 800px) {
						.maplibregl-ctrl-bottom-left .maplibregl-ctrl-scale {
							margin-left: 3.6rem;
							border-right: none;
							border-left: none;
							line-height: 1rem;
							background: none;
							border-bottom-color: var(--darkColor);
							color: var(--darkColor);
							font-weight: 600;
							filter: drop-shadow(0px 0px 2px #ffffffa6);
						}
					}
				`}
			/>
		</>
	)
}
