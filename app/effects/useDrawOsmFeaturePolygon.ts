import { useMemo } from 'react'
import useDrawQuickSearchFeatures from './useDrawQuickSearchFeatures'

export default function useDrawOsmFeaturePolygon(
	map,
	osmFeature,
	safeStyleKey
) {
	const code = osmFeature?.id
	const features = useMemo(() => (osmFeature ? [osmFeature] : []), [code])
	const category = useMemo(
		() => ({
			name: 'vers-' + code,
			icon: 'pins',
			'open by default': true,
		}),
		[code]
	)
	const invert = true
	useDrawQuickSearchFeatures(
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
