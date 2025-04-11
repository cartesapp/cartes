const isImportantContourLine = [
	'any',
	['==', ['get', 'div'], 50],
	['==', ['get', 'div'], 100],
	['==', ['get', 'div'], 200],
	['==', ['get', 'div'], 1000],
	['==', ['get', 'div'], 2000],
]

// @dark : is the base layer dark (satellite is dark) or light (regular vector
// map is light) ?
const contourLayers = (dark) => [
	{
		id: 'Contour index',
		type: 'line',
		source: 'contours',
		'source-layer': 'contours',
		layout: {
			visibility: 'visible',
		},
		paint: {
			'line-color': `hsl(22, 35%, ${dark ? 95 : 55}%)`,
			'line-width': 1.3,
			'line-opacity': {
				stops: [
					[7, 0.2],
					[10, 0.6],
				],
			},
		},
		filter: isImportantContourLine,
	},
	{
		id: 'Contour',
		type: 'line',
		source: 'contours',
		'source-layer': 'contours',
		layout: {
			visibility: 'visible',
		},
		paint: {
			'line-color': `hsl(22, 35%, ${dark ? 95 : 55}%)`,
			'line-width': 0.8,
			'line-opacity': 0.5,
		},
	},
	{
		id: 'Contour labels',
		type: 'symbol',
		source: 'contours',
		'source-layer': 'contours',
		layout: {
			'text-font': ['RobotoRegular-NotoSansRegular'],
			'text-size': {
				base: 1,
				stops: [
					[15, 9.5],
					[20, 12],
				],
			},
			'text-field': '{ele}',
			visibility: 'visible',
			'text-padding': 10,
			'symbol-placement': 'line',
			'symbol-avoid-edges': true,
			'text-allow-overlap': false,
			'text-ignore-placement': false,
			'text-rotation-alignment': 'map',
		},
		paint: {
			'text-color': `hsl(20, 28%, ${dark ? 100 : 32}%)`,
			'text-halo-blur': 1,
			'text-halo-color': `hsl(0, 0%, ${dark ? 0 : 100}%)`,
			'text-halo-width': 0.5,
		},
		metadata: {},
		filter: ['all', isImportantContourLine],
	},
]

const hillshadeLayers = (dark) => [
	{
		id: 'Hillshade',
		type: 'hillshade',
		source: 'terrain-rgb',
		layout: {
			visibility: 'visible',
		},
		paint: dark
			? // just inverted the values, we can probably do much better for dark
			  {
					'hillshade-accent-color': 'hsl(51, 30%, 20%)',
					'hillshade-shadow-color': 'hsl(0, 0%, 50%)',
					'hillshade-highlight-color': 'hsl(0, 0%, 17%)',
			  }
			: {
					'hillshade-accent-color': 'hsl(51, 30%, 79%)',
					'hillshade-shadow-color': 'hsl(0, 0%, 50%)',
					'hillshade-highlight-color': 'hsl(0, 0%, 83%)',
			  },
	},
]

const createTerrainLayers = (dark) => [
	...hillshadeLayers(dark),
	...contourLayers(dark),
]
export default createTerrainLayers
