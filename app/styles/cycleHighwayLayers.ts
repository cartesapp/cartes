export const cycleHighwayMaxZoom = 15
const cycleHighwaysLineWidth = (outline = false) => [
	'interpolate',
	['linear'],
	['zoom'],
	0,
	0,
	11,
	outline ? 4 : 2,
	14,
	outline ? 6 : 3,
	16,
	outline ? 8 : 5,
	22,
	outline ? 5 : 3,
]

export const cycleHighwayLayers = (dark = false) => [
	{
		id: 'Cycle highways outline',
		type: 'line',
		minzoom: 10,
		maxzoom: cycleHighwayMaxZoom,
		source: 'cycleHighways',
		'source-layer': 'cycleHighways',
		layout: {
			'line-cap': 'round',
			'line-join': 'round',
		},
		paint: {
			'line-color': dark ? 'hsl(240, 70%, 60%)' : 'hsl(240, 71%, 72%)',
			'line-width': cycleHighwaysLineWidth(true),
		},
	},
	{
		id: 'Cycle highways',
		type: 'line',
		minzoom: 10,
		maxzoom: cycleHighwayMaxZoom,
		source: 'cycleHighways',
		'source-layer': 'cycleHighways',
		layout: {
			'line-cap': 'round',
			'line-join': 'round',
		},
		paint: {
			'line-color': dark ? 'hsl(240,70%,80%)' : 'hsl(0,0%,97%)',
			'line-width': cycleHighwaysLineWidth(),
		},
	},
	{
		id: 'Cycle highways icons',
		type: 'symbol',
		source: 'cycleHighways',
		'source-layer': 'cycleHighways',
		minzoom: 10,
		maxzoom: cycleHighwayMaxZoom,
		layout: {
			'icon-size': [
				'interpolate',
				['linear'],
				['zoom'],
				0,
				0,
				11,
				0.7,
				14,
				0.8,
				16,
				1.5,
				22,
				2,
			],
			'icon-image': 'bicycle',
			visibility: 'visible',
			'symbol-spacing': 200,
			'symbol-placement': {
				base: 1,
				stops: [
					[7, 'point'],
					[7, 'line'],
					[8, 'line'],
				],
			},
			'symbol-avoid-edges': true,
			'icon-rotation-alignment': 'viewport',
			'text-rotation-alignment': 'viewport',
		},
		paint: {
			'icon-color': dark ? '#aa3333' : 'red',
		},
	},
]
