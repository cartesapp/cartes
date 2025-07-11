import getBbox from '@turf/bbox'
import { useEffect } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { stamp } from '../itinerary/transit/utils'
import { expandBbox } from '@/components/mapUtils'

export default function useCenterMapOnState(
	map,
	zoom,
	vers,
	stepsLength,
	state,
	paddingHash,
	padding
) {
	const [autoPitchPreference, setAutoPitchPreference] = useLocalStorage(
		'autoPitchPreference',
		null,
		{
			initializeWithValue: false,
		}
	)

	const autoPitchPreferenceIsNo = autoPitchPreference === 'no'
	/*
	 *
	 * Fly to hook
	 *
	 * */
	useEffect(() => {
		if (!map || !vers) return
		if (!(vers.geojson || vers.center)) return
		if (stepsLength > 1) {
			const coordinates = state
				.filter((step) => step?.center)
				.map((step) => step.center.geometry.coordinates.map((el) => +el))

			if (coordinates.length < 2) return

			const lineString = {
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates,
				},
				properties: {},
			}

			console.log('indigo yaya', lineString)
			const bbox = getBbox(lineString)

			// For some reason, this can crash. I guess the expandBbox function is not
			// entirely correct ? Non critical #975

			try {
				map.fitBounds(expandBbox(bbox), { padding })
			} catch (e) {
				console.log('Error expanding bbox ? ', bbox)
			}

			return
		}

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
		if (vers.geojson) {
			const bbox = getBbox(vers.geojson)
			map.fitBounds(bbox, {
				maxZoom: 17.5, // We don't want to zoom at door level for a place, just at street level
			})
		} else {
			if (!autoPitchPreferenceIsNo) setAutoPitchPreference(stamp())
			const auto3d = !autoPitchPreferenceIsNo

			const center = vers.center.geometry.coordinates
			map.flyTo({
				center,
				zoom: tailoredZoom,
				pitch: autoPitchPreferenceIsNo ? 0 : 40, // pitch in degrees
				bearing: autoPitchPreferenceIsNo ? 0 : 15, // bearing in degrees
				// speed and maxDuration could let us zoom less quickly between shops,
				// but then the animation from town to town wouldn't take place anymore.
				// This animation lets the user understand the direction of the move.
				padding,
			})
		}
	}, [
		map,
		vers,
		stepsLength,
		autoPitchPreferenceIsNo,
		setAutoPitchPreference,
		paddingHash,
		state,
	])
}
