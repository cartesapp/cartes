import { useMemo } from 'react'
import useDrawFeatures from './useDrawFeatures'

export default function useDrawOsmFeaturePolygon(
	map,
	osmFeature,
	safeStyleKey
) {
	const code = osmFeature?.osmCode
	console.log('indigo debug geojson', osmFeature)
	const features = useMemo(() => (osmFeature ? [osmFeature] : []), [code])
	const category = useMemo(
		() => ({
			name: 'vers-' + code,
			icon: 'pins',
			iconSize: 60,
			iconAnchor: 'bottom',
			'open by default': true,
		}),
		[code]
	)
	const invert = true
	useDrawFeatures(
		map,
		features,
		false,
		category,
		null,
		undefined,
		invert,
		safeStyleKey
	)
}
