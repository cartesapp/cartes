export default function natureStyle() {
	return {
		version: 8,
		id: 'satellite',
		name: 'Satellite',
		sources: {
			'terrain-rgb': {
				url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${key}`,
				type: 'raster-dem',
			},
			'satellite-tiles': {
				type: 'raster',
				tiles: [
					'https://data.geopf.fr/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/jpeg&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
				],
				tileSize: 256,
				attribution: 'IGN-F/Geoportail',
			},
		},
		layers: [
			{
				id: 'satellite-layer',
				type: 'raster',
				source: 'satellite-tiles',
				paint: {},
			},
		],
		bearing: 0,
		pitch: 0,
		center: [0, 0],
		zoom: 1,
		minZoom: 0,
		maxZoom: 18,
	}
}
