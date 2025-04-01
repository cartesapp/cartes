import { getFetchUrlBase } from '../serverUrls'

export default function satelliteIgn(key) {
	return {
		version: 8,
		id: 'satellite-ign',
		name: 'Satellite IGN',
		sources: {
			'satellite-maptiler': {
				url: `https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=${key}`,
				type: 'raster',
			},
			'satellite-ign': {
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
				id: 'satellite-maptiler',
				type: 'raster',
				source: 'satellite-maptiler',
				minzoom: 11,
				layout: { visibility: 'visible' },
				filter: ['all'],
				paint: {
					'raster-opacity': [
						'interpolate',
						['linear'],
						['zoom'],
						0,
						0,
						11,
						0,
						12,
						1,
					],
				},
			},
			{
				id: 'satellite-ign',
				type: 'raster',
				source: 'satellite-ign',
				minzoom: 0,
				maxzoom: 12,
				paint: {
					'raster-opacity': [
						'interpolate',
						['linear'],
						['zoom'],
						0,
						1,
						11,
						1,
						12,
						0,
					],
				},
			},
		],
		bearing: 0,
		pitch: 0,
		center: [0, 0],
		zoom: 1,
		minZoom: 0,
		maxZoom: 18,
		glyphs: getFetchUrlBase() + '/fonts/glyphs/{fontstack}/{range}.pbf',
	}
}
