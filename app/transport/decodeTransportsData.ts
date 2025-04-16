import { omit } from '@/components/utils/utils'
import mapboxPolyline from '@mapbox/polyline'
import { addDefaultColor } from './enrichTransportsData'

export const decodeTransportsData = ([agencyId, agencyData]) => {
	console.log('purple will decode transports data')
	const { polylines, points, features: featuresRaw } = agencyData
	const lineStrings = polylines && polylines.map(polylineObjectToLineString)

	const features = (featuresRaw || [...lineStrings, ...points]).map(
		(feature) => ({
			...feature,
			properties: { ...feature.properties, agencyId },
		})
	)
	/* Splines don't work : seeminlgy straight equal LineString diverge
					 * because of splines
					const features = straightFeatures.map((feature) =>
						feature.geometry.type === 'LineString'
							? bezierSpline(feature)
							: feature
					)
					*/

	const result = addDefaultColor(features, agencyId)
	return [agencyId, { ...agencyData, features: result }]
}

export const polylineObjectToLineString = (polylineObject) => ({
	type: 'Feature',
	geometry: mapboxPolyline.toGeoJSON(polylineObject.polyline),
	properties: omit(['polyline'], polylineObject),
})
