'use client'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { sortGares } from './gares'

import MapButtons, { mapButtonSize } from '@/components/MapButtons'
import { goodIconSize, useComputeMapPadding } from '@/components/mapUtils'
import useSetSearchParams from '@/components/useSetSearchParams'
import useAddMap, { globeLight, highZoomLight } from './effects/useAddMap'
import useTerraDraw from './effects/useTerraDraw'
import { getStyle } from './styles/styles'
import useHoverOnMapFeatures from './useHoverOnMapFeatures'
import useTerrainControl from './useTerrainControl'

import useMapContent from '@/components/map/useMapContent'
import { styled } from 'next-yak'
import CenteredCross from './CenteredCross'
import MapComponents from './MapComponents'
import MapCompassArrow from './boussole/MapCompassArrow'
import { defaultState } from './defaultState'
import useDrawElectionClusterResults from './effects/useDrawElectionCluserResults'
import useDrawPanoramaxPosition, {
	useAddPanoramaxLayer,
} from './effects/useDrawPanoramaxPosition'
import useDrawRightClickMarker from './effects/useDrawRightClickMarker'
import useDrawSearchResults from './effects/useDrawSearchResults'
import useDrawTransport from './effects/useDrawTransport'
import useGeolocationAutofocus from './effects/useGeolocationAutofocus'
import useImageSearch from './effects/useImageSearch'
import useMapClick from './effects/useMapClick'
import useRightClick from './effects/useRightClick'
import useSearchLocalTransit from './effects/useSearchLocalTransit'
import useDrawItinerary from './itinerary/useDrawItinerary'
import { polylineObjectToLineString } from './transport/decodeTransportsData'
import { addDefaultColor } from './transport/enrichTransportsData'
import { computeCenterFromBbox } from './utils'
import useCenterMapOnState from './effects/useCenterMapOnState'

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
		isTransportsMode,
		transportsData,
		agencyAreas,
		clickedStopData,
		itinerary,
		bbox,
		setBbox,
		clickGare = () => null,
		clickedGare = null,
		gares = [],
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
		quickSearchFeaturesMap,
		trackedSnap,
		panoramaxPosition,
		geocodedClickedPoint,
		setMapLoaded,
		wikidata,
		setLastGeolocation,
		geolocation,
		setMapContent,
		setChargement,
	} = props

	//useWhatChanged(props, 'Render component Map')

	const mapContainerRef = useRef(null)
	const stepsLength = state.filter((step) => step?.allezValue).length

	const style = useMemo(() => getStyle(styleKey), [styleKey]),
		styleUrl = style.url

	const [map, triggerGeolocation, geolocate] = useAddMap(
		styleUrl,
		setZoom,
		setBbox,
		mapContainerRef,
		setGeolocation,
		setMapLoaded
	)
	useMapContent(map, bbox, setMapContent)
	const setSearchParams = useSetSearchParams()

	const shouldGeolocate = searchParams.geoloc
	useEffect(() => {
		if (!map || !shouldGeolocate) return
		console.log('will trigger maplibregeolocate')
		triggerGeolocation()
		setSearchParams({ geoloc: undefined })
	}, [map, triggerGeolocation, shouldGeolocate, setSearchParams])

	const padding = useComputeMapPadding(trackedSnap, searchParams)
	console.log({ trackedSnap, padding })

	useGeolocationAutofocus(map, itinerary?.isItineraryMode, geolocation, padding)

	const paddingHash = Object.entries(padding).join('')
	useEffect(() => {
		if (!map) return

		map.flyTo({ padding })
	}, [map, paddingHash])

	const wikidataPicture = wikidata?.pictureUrl

	const wikidataPictureObject = wikidataPicture &&
		vers &&
		vers.requestState === 'success' && {
			thumbnailUrl: wikidataPicture,
			title: wikidata.pictureName, //could be better
			fromWikidata: true,
			lon: vers.center.geometry.coordinates[0],
			lat: vers.center.geometry.coordinates[1],
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
		map.fitBounds(mapLibreBBox, { padding, duration: 1 })
	}, [map, agency])

	const givenBbox = searchParams.bbox
	useEffect(() => {
		if (!map || !givenBbox) return

		const bounds = givenBbox.split(',')

		const mapLibreBBox = [
			[bounds[1], bounds[0]],
			[bounds[3], bounds[2]],
		]
		map.fitBounds(mapLibreBBox, { padding })
	}, [map, givenBbox])

	useDrawElectionClusterResults(map, styleKey, searchParams.filtre)

	const hasItinerary = stepsLength > 1

	const clickedStopDataFeatures = clickedStopData[1]?.features || []

	const enrichedStopFeatures = useMemo(() => {
		const geojsonFeatures = clickedStopDataFeatures.map((feature) =>
			feature.polyline ? polylineObjectToLineString(feature) : feature
		)
		const result = addDefaultColor(geojsonFeatures, null)

		return result
	}, [clickedStopData[0]])
	useDrawTransport(map, enrichedStopFeatures, safeStyleKey, hasItinerary)

	useDrawItinerary(
		map,
		itinerary.isItineraryMode,
		searchParams,
		state,
		zoom,
		itinerary.routes,
		itinerary.date
	)

	const onSearchResultClick = useCallback(
		(feature) => {
			setState([...state.slice(0, -1), defaultState.vers])
		},
		[state]
	)

	//TODO this hook should be used easily with some tweaks to draw the borders of
	// the clicked feature, and an icon
	// Edit : we draw contours now, for the search results clicked feature

	useDrawSearchResults(map, state, onSearchResultClick)

	useTerrainControl(map, style, searchParams.relief)
	useTerraDraw(map, searchParams.dessin)

	useEffect(() => {
		if (!map) return
		if (Math.round(map.getZoom()) === zoom) return
		map.flyTo({ zoom })
	}, [zoom, map])

	const [lightType, setLightType] = useState('highZoom')
	useEffect(() => {
		if (!map) return
		map.on('zoom', () => {
			console.log('map event zoom')
		})
		map.on('moveend', () => {
			const approximativeZoom = Math.round(map.getZoom())
			if (approximativeZoom !== zoom) setZoom(approximativeZoom)

			if (approximativeZoom < 6 && lightType === 'highZoom') {
				setLightType('globeLight')
				map.setLight(globeLight)
			}
			if (approximativeZoom >= 6 && lightType === 'globeLight') {
				setLightType('highZoom')
				map.setLight(highZoomLight)
			}

			console.log('map event moveend')
			const newBbox = map.getBounds().toArray()
			setBbox(newBbox)
			setLastGeolocation({
				center: computeCenterFromBbox(newBbox),
				zoom: approximativeZoom,
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
		setState,
		searchParams.dessin,
		itinerary,
		isTransportsMode,
		setLatLngClicked,
		gares,
		clickGare,
		setSearchParams,
		styleKey,
		searchParams['choix du style'] === 'oui',
		setChargement
	)

	useHoverOnMapFeatures(map)

	useCenterMapOnState(map, zoom, vers, stepsLength, state, paddingHash, padding)

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
	useDrawRightClickMarker(map, geocodedClickedPoint, padding)

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
						quickSearchFeaturesMap,
						onSearchResultClick,
					}}
				/>
			)}
			<MapContainer ref={mapContainerRef} $mapButtonSize={mapButtonSize} />
		</>
	)
}

export const MapContainer = styled.div`
	:global(
			.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon
		) {
		background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='29' height='29' fill='crimson' viewBox='0 0 29 29'%3E%3Cpath d='m10.5 14 4-8 4 8z'/%3E%3Cpath fill='%23ccc' d='m10.5 16 4 8 4-8z'/%3E%3C/svg%3E");
	}

	:global(.maplibregl-ctrl-bottom-left .maplibregl-ctrl-scale) {
		margin-left: 4rem;
	}
	@media (max-width: 800px) {
		:global(.maplibregl-ctrl-bottom-left .maplibregl-ctrl-scale) {
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
	:global(.maplibregl-ctrl-top-right) button {
		width: ${(p) => p.$mapButtonSize};
		height: ${(p) => p.$mapButtonSize};
	}
	:global(.maplibregl-ctrl-indoorequal) {
		position: absolute;
		top: 26rem;
	}
	:global(.maplibregl-ctrl-top-left) {
		z-index: 10;
		@media (min-width: 800px) {
			margin-top: 2rem;
		}
	}
`
