import { lightenColor } from '@/components/utils/colors'
import { handleColor, trainColors } from '@/app/itinerary/transit/motisRequest'

// Here we make counts for a GTFS agency, to know which lines are relatively
// frequent. But I don't think it's the right approach, it should be absolute.
//
// If my agency is poor, the best line shouldn't be green even if it's the
// most frequent one. Paris' lest frequent subway shouldn't be red either, it's
// still one of the best line of the country.
//
// Also, these metrics should be computed server-side.
export const addDefaultColor = (features, agencyId) => {
	/*
	const maxCountLine = Math.max(
		...featureCollection.features
			.map(
				(feature) =>
					feature.geometry.type === 'LineString' && feature.properties.perDay
			)
			.filter(Boolean)
	)
	const maxCountPoint = Math.max(
		...featureCollection.features
			.map(
				(feature) =>
					feature.geometry.type === 'Point' && feature.properties.perDay
			)
			.filter(Boolean)
	)

*/
	const isSncf = agencyId === '1187'

	return features.map((feature) => {
		if (feature.geometry.type === 'Point') {
			const [color, strokeColor] = stopColor(features, feature)
			console.log('purple enrich transport stop with colors and width', feature)
			return {
				...feature,
				properties: {
					...feature.properties,
					width:
						classifyStopFrequency(feature.properties.perDay, isSncf ? 15 : 30) /
						(isSncf ? 1.8 : 6),
					'circle-stroke-color': strokeColor,
					'circle-color': color,
				},
			}
		}
		return {
			...feature,
			properties: {
				...feature.properties,
				route_color: isSncf
					? trainColor(feature.properties)
					: handleColor(feature.properties.route_color, 'gray'),
				width:
					{
						0: 1.6,
						1: 2.6,
						2: 3,
						3: 0.8,
						undefined: 0.8,
					}[feature.properties.route_type] * 0.6,
				opacity: classifyStopFrequency(feature.properties.perDay, 2),
			},
		}
	})
}

const stopColor = (features, stop) => {
	const list = features.filter((f) =>
		f.properties.stopList?.includes(stop.properties.name)
	)

	if (list.length === 1) {
		const color = handleColor(list[0].properties.route_color, 'gray')
		return [color, color.startsWith('#') ? lightenColor(color, -15) : 'black']
	}
	return ['white', 'black']
}

const classifyStopFrequency = (perDayRaw, tuning) => {
	const perDay = perDayRaw / tuning
	const perWeek = perDay * 7
	if (perWeek < 1) return 1 / 5
	if (perDay < 3) return 2 / 5
	const perHour = perDay / 12 // could be tweaked
	if (perHour < 1) return 3 / 5
	if (perHour < 6) return 4 / 5
	return 5 / 5
}
// Lol, the SNCF GTFS is so poor
const trainColor = (properties) => {
	/* not sure the colors provided by SNCF are great compared to colors by train
	 * type
	 *
	const givenColor = handleColor(properties.route_color, null)
	console.log('GIVEN', givenColor)
	if (givenColor) return givenColor

	*/
	return trainColors[properties.sncfTrainType]?.color || 'chartreuse'
	const route = properties.route_long_name

	if (
		[
			'Paris - Briançon',
			'Paris - Rodez / Albi',
			'Paris Austerlitz - Latour de Carole',
		]
	)
		return '#28166f'

	return '#821a73'
}
