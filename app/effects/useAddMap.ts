import maplibregl, { ScaleControl } from 'maplibre-gl'
import { useEffect, useMemo, useState } from 'react'
import { useLocalStorage, useMediaQuery, useTimeout } from 'usehooks-ts'
import { styles } from '../styles/styles'
import { Protocol as ProtomapsProtocol } from 'pmtiles'
import useGeolocation from './useGeolocation'
import frenchMaplibreLocale from '@/components/map/frenchMaplibreLocale.ts'
import { Protocol as CartesProtocol } from '@/components/map/CartesProtocol.ts'
import useEffectDebugger from '@/components/useEffectDebugger'
import { isLocalStorageAvailable } from '@/components/utils/utils'
import IndoorEqual from 'maplibre-gl-indoorequal'
import 'maplibre-gl-indoorequal/maplibre-gl-indoorequal.css'

/*
 *
 * {"city":"Rennes","country":"FR","flag":"🇫🇷","countryRegion":"BRE","region":"cdg1","latitude":"48.11","longitude":"-1.6744"}
 *
 * */

const morningDate = new Date('March 13, 08 07:20'),
	dayDate = new Date('March 13, 08 14:20'),
	eveningDate = new Date('March 13, 08 20:23')
const date = new Date()

const hoursOfDay = date.getHours()
export const defaultSky =
	hoursOfDay < 8 || hoursOfDay > 18 //TODO see RouteRésumé, it has time of sunset. Make an aurora light too, different from the sunset, and handle the light below
		? {
				'sky-color': '#76508B',
				'horizon-color': '#FCB4AB',
				'fog-color': '#FD8E35',
		  }
		: {
				'sky-color': '#199EF3',
				'sky-horizon-blend': 0.5,
				'horizon-color': '#ffffff',
				'horizon-fog-blend': 0.5,
				'fog-color': '#0000ff',
				'fog-ground-blend': 0.5,
				'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 7, 0],
		  }

export const defaultProjection = {
	type: 'globe',
}
// TODO I haven't yet understood how to handle this. With the globe mode, we
// should let the light follow the real sun, and enable the user to tweak it
export const globeLight = {
	anchor: 'viewport',
	color: 'pink',
	intensity: 0.1,
	position: [1.55, 180, 180],
}

export const highZoomLight = {
	anchor: 'viewport',
	color: '#ffffff',
	intensity: 0.5,
	position: [1.15, 210, 30],
}

export const defaultCenter =
	// Saint Malo
	// [-1.9890417068124002, 48.66284934737089]
	// Rennes [-1.678, 48.11]
	[2.025, 46.857]

export const defaultZoom = 5.52
const defaultGeolocation = { center: defaultCenter, zoom: defaultZoom }
const defaultHash = `#${defaultZoom}/${defaultCenter[1]}/${defaultCenter[0]}`

export default function useAddMap(
	styleUrl,
	setZoom,
	setBbox,
	mapContainerRef,
	setGeolocation,
	setMapLoaded
	// This for hot reload, I don't why this hook gets called again losing the map
	// state, very annoying
) {
	const [map, setMap] = useState(null)
	const [geolocate, setGeolocate] = useState(null)
	const isMobile = useMediaQuery('(max-width: 800px)')

	const geolocation = useGeolocation({
		latitude: defaultCenter[1],
		longitude: defaultCenter[0],
	})
	const { latitude, longitude } = geolocation

	const ipGeolocationCenter = useMemo(
		() => [longitude, latitude],
		[longitude, latitude]
	)

	useEffect(() => {
		if (!map) return

		map.flyTo({
			center: ipGeolocationCenter,
		})
	}, [ipGeolocationCenter, map])

	useEffect(() => {
		let protomapsProtocol = new ProtomapsProtocol()
		let cartesProtocol = new CartesProtocol()
		maplibregl.addProtocol('pmtiles', protomapsProtocol.tile)
		maplibregl.addProtocol('cartes', cartesProtocol.tile)
		return () => {
			maplibregl.removeProtocol('pmtiles')
			maplibregl.removeProtocol('cartes')
		}
	}, [])

	const [autoPitchPreference, setAutoPitchPreference] = useLocalStorage(
		'autoPitchPreference',
		null,
		{
			initializeWithValue: false,
		}
	)

	useEffect(() => {
		if (!map) return
		const compass = document.querySelector('.maplibregl-ctrl-compass')
		if (!compass) return
		const handler = () => {
			const autoPitchPreferenceIsWaiting =
				typeof autoPitchPreference === 'number'
			if (
				autoPitchPreferenceIsWaiting &&
				new Date().getTime() / 1000 - autoPitchPreference < 15 // If the user resets the pitch in less than 15 seconds, we consider it a definitive choice
			)
				setAutoPitchPreference('no')
		}
		compass.addEventListener('click', handler)

		return () => {
			compass && compass.removeEventListener('click', handler)
		}
	}, [map, autoPitchPreference, setAutoPitchPreference])

	const [lastGeolocation] = useLocalStorage(
		'lastGeolocation',
		{
			center: defaultCenter,
			zoom: defaultZoom,
		},

		{
			initializeWithValue: false,
		}
	)

	useEffectDebugger(() => {
		if (!mapContainerRef.current) return

		const lastGeolocation =
			isLocalStorageAvailable() &&
			JSON.parse(localStorage.getItem('lastGeolocation'))

		const { center, zoom } = lastGeolocation || defaultGeolocation
		console.log('darkgreen', lastGeolocation)

		const newMap = new maplibregl.Map({
			container: mapContainerRef.current,
			style: styleUrl,
			maxPitch: 85,
			center,
			zoom,
			hash: true,
			attributionControl: false,
			locale: frenchMaplibreLocale,
			antialias: true,
		})

		newMap.on('load', () => {
			setMapLoaded(true)
			setMap(newMap)

			setZoom(Math.round(newMap.getZoom()))
			setBbox(newMap.getBounds().toArray())
		})

		newMap.on('style.load', () => {
			newMap.setSky(defaultSky)
			newMap.setProjection(defaultProjection)
			newMap.setLight(highZoomLight)
		})

		newMap.on('moveend', (e) => {
			setBbox(newMap.getBounds().toArray())
		})

		return () => {
			setMap(null)
			newMap?.remove()
		}
	}, [setMap, setMapLoaded, setZoom, setBbox, mapContainerRef, setGeolocate]) // styleUrl not listed on purpose

	const triggerGeolocation = useMemo(
		() => (geolocate ? () => geolocate.trigger() : () => 'Not ready'),
		[geolocate]
	)

	useEffect(() => {
		if (!map) return

		const navigationControl = new maplibregl.NavigationControl({
			visualizePitch: true,
			showZoom: !isMobile,
			showCompass: true,
		})
		map.addControl(navigationControl, 'top-right')

		const geolocate = new maplibregl.GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true,
			},
			trackUserLocation: true,
		})

		setGeolocate(geolocate)

		map.addControl(geolocate)

		geolocate.on('geolocate', function (e) {
			setGeolocation(e.coords)
		})

		const scale = new ScaleControl({
			maxWidth: isMobile ? 80 : 200,
			unit: 'metric',
		})
		map.addControl(scale)

		setTimeout(() => {
			console.log('go indoor')
			const indoorEqual = new IndoorEqual(map, {
				apiKey: process.env.NEXT_PUBLIC_INDOOREQUAL,
			})

			indoorEqual.loadSprite('indoorequal/indoorequal')
			map.addControl(indoorEqual)
		}, 4000)

		return () => {
			if (!map || !scale) return
			try {
				map.removeControl(scale)
				map.removeControl(navigationControl)
				map.removeControl(geolocate)
				map.removeControl(indoorEqual)
			} catch (e) {
				console.log('Error removing scale')
			}
		}
	}, [map, isMobile, setGeolocation, setGeolocate])

	useEffect(() => {
		if (!map || !isMobile || window.location.hash !== defaultHash) return
		setTimeout(() => {
			triggerGeolocation()
		}, 2000)
	}, [map, isMobile, triggerGeolocation])

	useEffect(() => {
		if (!map) return
		const style = Object.values(styles).find((style) => style.url === styleUrl)
		const attribution = new maplibregl.AttributionControl({
			customAttribution: style.attribution,
		})
		map.addControl(attribution)

		return () => {
			try {
				map.removeControl(attribution)
			} catch (e) {
				console.log('Error remove attribution', e)
			}
		}
	}, [map, styleUrl])

	return [map, triggerGeolocation, geolocate]
}
