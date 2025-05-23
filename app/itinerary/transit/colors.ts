export const trainColors = {
	TGV: { color: '#b8175e' },
	OUIGO: { color: '#e60075', border: '#0096ca' },
	'Train TER': { color: '#004da4' },
	TER: { color: '#004da4' },
	'TGV INOUI': { color: '#9b2743' },
	'INTERCITES de nuit': { color: '#28166f' },
	INTERCITES: { color: 'Teal' },
	'Car TER': { color: '#004da4', pointillés: true },
	Car: { color: '#004da4', pointillés: true },
	Lyria: { color: '#eb0a28' },
	ICE: { color: '#f01414' },
	TramTrain: { color: '#004da4' },
	Navette: { color: '#004da4', pointillés: true },
}
export function handleColor(rawColor, defaultColor) {
	if (!rawColor) return defaultColor
	if (rawColor.startsWith('#')) return rawColor
	if (rawColor.match(/^([0-9A-Fa-f])+$/) && rawColor.length === 6)
		return '#' + rawColor
	console.log('Unrecognized route color', rawColor)
	return defaultColor
}
