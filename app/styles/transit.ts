import { maptilerNameExpression } from './voyage'

export default function voyageStyle(key) {
	return {
		version: 8,
		id: 'transit',
		name: 'Cartes.app Transit',
		sources: {
			maptiler_planet: {
				url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${key}`,
				type: 'vector',
			},
			maptiler_attribution: {
				attribution:
					'<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
				type: 'vector',
			},
		},
		layers: [
			{
				id: 'Background',
				type: 'background',
				layout: { visibility: 'visible' },
				paint: {
					'background-color': 'hsl(30,25%,98%)',
					'background-opacity': 1,
				},
			},
			{
				id: 'Residential',
				type: 'fill',
				source: 'maptiler_planet',
				'source-layer': 'landuse',
				minzoom: 6,
				maxzoom: 13,
				layout: { visibility: 'visible' },
				paint: {
					'fill-color': {
						stops: [
							[6, 'hsl(0, 0%, 94%)'],
							[13, 'hsl(0,0%,93%)'],
						],
					},
					'fill-opacity': 1,
					'fill-antialias': true,
				},
				filter: ['==', 'class', 'residential'],
			},
			{
				id: 'Landcover',
				type: 'fill',
				source: 'maptiler_planet',
				'source-layer': 'landcover',
				layout: { visibility: 'visible' },
				paint: {
					'fill-color': 'hsl(96, 44%, 79%)',
					'fill-opacity': {
						stops: [
							[8, 0.2],
							[9, 0.25],
							[11, 0.35],
						],
					},
					'fill-antialias': false,
				},
				filter: ['in', 'class', 'wood', 'grass'],
			},
			{
				id: 'Forest',
				type: 'fill',
				source: 'maptiler_planet',
				'source-layer': 'globallandcover',
				maxzoom: 7,
				layout: { visibility: 'visible' },
				paint: { 'fill-color': 'hsla(96, 44%, 79%, 0.15)' },
				filter: ['in', 'class', 'forest', 'tree'],
			},
			{
				id: 'Stadium',
				type: 'fill',
				source: 'maptiler_planet',
				'source-layer': 'landuse',
				minzoom: 10,
				maxzoom: 22,
				layout: { visibility: 'visible' },
				paint: {
					'fill-color': 'hsl(86,57%,88%)',
					'fill-opacity': {
						stops: [
							[10, 0.25],
							[14, 0.55],
						],
					},
					'fill-antialias': true,
					'fill-outline-color': 'hsl(85,26%,77%)',
				},
				filter: ['in', 'class', 'stadium', 'pitch'],
			},
			{
				id: 'Cemetery',
				type: 'fill',
				source: 'maptiler_planet',
				'source-layer': 'landuse',
				minzoom: 10,
				maxzoom: 22,
				layout: { visibility: 'visible' },
				paint: {
					'fill-color': 'hsl(0, 0%, 89%)',
					'fill-opacity': 1,
					'fill-antialias': true,
				},
				filter: ['==', 'class', 'cemetery'],
			},
			{
				id: 'River',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'waterway',
				layout: { visibility: 'visible' },
				paint: {
					'line-color': 'hsl(187,37%,87%)',
					'line-width': [
						'interpolate',
						['linear'],
						['zoom'],
						8,
						0.5,
						9,
						1,
						15,
						1.5,
						16,
						2.5,
					],
				},
			},
			{
				id: 'Water shadow',
				type: 'fill',
				source: 'maptiler_planet',
				'source-layer': 'water',
				minzoom: 0,
				maxzoom: 22,
				layout: { visibility: 'visible' },
				paint: {
					'fill-color': 'hsl(196,28%,74%)',
					'fill-opacity': 1,
					'fill-antialias': true,
				},
				filter: [
					'all',
					['==', '$type', 'Polygon'],
					['!=', 'brunnel', 'tunnel'],
				],
			},
			{
				id: 'Water',
				type: 'fill',
				source: 'maptiler_planet',
				'source-layer': 'water',
				minzoom: 0,
				layout: { visibility: 'visible' },
				paint: {
					'fill-color': 'hsl(187, 36%, 87%)',
					'fill-opacity': 1,
					'fill-antialias': true,
					'fill-translate': {
						stops: [
							[0, [0, 2]],
							[6, [0, 3]],
							[12, [0, 2]],
							[14, [0, 0]],
						],
					},
					'fill-translate-anchor': 'map',
				},
				filter: [
					'all',
					['==', '$type', 'Polygon'],
					['!=', 'brunnel', 'tunnel'],
				],
			},
			{
				id: 'Aeroway',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'aeroway',
				minzoom: 12,
				layout: {
					'line-cap': 'round',
					'line-join': 'round',
					visibility: 'visible',
				},
				paint: {
					'line-color': 'hsl(0, 0%, 87%)',
					'line-width': [
						'interpolate',
						['linear', 1],
						['zoom'],
						11,
						['match', ['get', 'class'], ['runway'], 3, 0.5],
						15,
						['match', ['get', 'class'], ['runway'], 15, 6],
						16,
						['match', ['get', 'class'], ['runway'], 20, 6],
					],
				},
				metadata: {},
				filter: ['==', '$type', 'LineString'],
			},
			{
				id: 'Tunnel outline',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				minzoom: 11,
				maxzoom: 22,
				layout: {
					'line-cap': 'round',
					'line-join': 'round',
					visibility: 'visible',
				},
				paint: {
					'line-color': 'hsl(0, 0%, 85%)',
					'line-width': [
						'interpolate',
						['linear', 2],
						['zoom'],
						4,
						0.5,
						7,
						0.5,
						10,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 0, 2.5],
							['trunk', 'primary'],
							2.4,
							0,
						],
						12,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 2, 6],
							['trunk', 'primary'],
							3,
							['secondary', 'tertiary'],
							2,
							['minor', 'service', 'track'],
							1,
							0.5,
						],
						14,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 5, 8],
							['trunk'],
							4,
							['primary'],
							6,
							['secondary'],
							6,
							['tertiary'],
							4,
							['minor', 'service', 'track'],
							3,
							3,
						],
						16,
						[
							'match',
							['get', 'class'],
							['motorway', 'trunk', 'primary'],
							10,
							['secondary'],
							9,
							['tertiary'],
							8,
							['minor', 'service', 'track'],
							6,
							6,
						],
						20,
						[
							'match',
							['get', 'class'],
							['motorway', 'trunk', 'primary'],
							26,
							['secondary'],
							26,
							['tertiary'],
							26,
							['minor', 'service', 'track'],
							18,
							18,
						],
					],
					'line-opacity': [
						'step',
						['zoom'],
						1,
						5,
						['match', ['get', 'class'], ['motorway', 'trunk'], 0.5, 0],
						6,
						['match', ['get', 'class'], ['motorway', 'trunk'], 0.5, 0],
						7,
						['match', ['get', 'class'], ['motorway', 'trunk'], 1, 0],
						8,
						['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 1, 0],
						11,
						[
							'match',
							['get', 'class'],
							['motorway', 'trunk', 'primary', 'secondary', 'tertiary'],
							1,
							0,
						],
						13,
						[
							'match',
							['get', 'class'],
							[
								'motorway',
								'trunk',
								'primary',
								'secondary',
								'tertiary',
								'minor',
							],
							1,
							0,
						],
						15,
						1,
					],
				},
				filter: [
					'all',
					[
						'in',
						'class',
						'motorway',
						'trunk',
						'primary',
						'secondary',
						'tertiary',
						'minor',
						'service',
					],
					['==', 'brunnel', 'tunnel'],
				],
			},
			{
				id: 'Tunnel path',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				minzoom: 15,
				maxzoom: 22,
				layout: {
					'line-cap': 'round',
					'line-join': 'round',
					visibility: 'visible',
				},
				paint: {
					'line-color': 'hsl(0, 0%, 90%)',
					'line-width': [
						'interpolate',
						['linear'],
						['zoom'],
						14,
						0.7,
						16,
						0.8,
						18,
						1,
						22,
						2,
					],
					'line-opacity': 1,
					'line-dasharray': [0.5, 2],
				},
				filter: ['all', ['==', 'class', 'path'], ['==', 'brunnel', 'tunnel']],
			},
			{
				id: 'Tunnel',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				minzoom: 11,
				maxzoom: 22,
				layout: {
					'line-cap': 'square',
					'line-join': 'miter',
					visibility: 'visible',
				},
				paint: {
					'line-color': 'hsl(0, 0%, 97%)',
					'line-width': [
						'interpolate',
						['linear', 2],
						['zoom'],
						5,
						0.5,
						6,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'brunnel'], ['bridge'], 0, 1],
							['trunk', 'primary'],
							0,
							0,
						],
						10,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 0, 2.5],
							['trunk', 'primary'],
							1.5,
							1,
						],
						12,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 1, 4],
							['trunk'],
							2.5,
							['primary'],
							2.5,
							['secondary', 'tertiary'],
							1.5,
							['minor', 'service', 'track'],
							1,
							1,
						],
						14,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 5, 6],
							['trunk'],
							3,
							['primary'],
							5,
							['secondary'],
							4,
							['tertiary'],
							3,
							['minor', 'service', 'track'],
							2,
							2,
						],
						16,
						[
							'match',
							['get', 'class'],
							['motorway', 'trunk', 'primary'],
							8,
							['secondary'],
							7,
							['tertiary'],
							6,
							['minor', 'service', 'track'],
							4,
							4,
						],
						20,
						[
							'match',
							['get', 'class'],
							['motorway', 'trunk', 'primary'],
							24,
							['secondary'],
							24,
							['tertiary'],
							24,
							['minor', 'service', 'track'],
							16,
							16,
						],
					],
					'line-opacity': [
						'step',
						['zoom'],
						1,
						10,
						['match', ['get', 'class'], 'motorway', 1, 0],
						11,
						['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 1, 0],
						13,
						[
							'match',
							['get', 'class'],
							['motorway', 'trunk', 'primary', 'secondary', 'tertiary'],
							1,
							0,
						],
						15,
						1,
					],
				},
				filter: [
					'all',
					[
						'in',
						'class',
						'motorway',
						'trunk',
						'primary',
						'secondary',
						'tertiary',
						'minor',
						'service',
					],
					['==', 'brunnel', 'tunnel'],
				],
			},
			{
				id: 'Railway tunnel',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				minzoom: 13,
				layout: { 'line-join': 'round', visibility: 'visible' },
				paint: {
					'line-color': 'hsl(0, 0%, 80%)',
					'line-width': {
						base: 1.3,
						stops: [
							[13, 0.5],
							[14, 1],
							[15, 1],
							[16, 3],
							[21, 7],
						],
					},
					'line-opacity': 0.5,
				},
				filter: ['all', ['==', 'class', 'rail'], ['==', 'brunnel', 'tunnel']],
			},
			{
				id: 'Railway tunnel dash',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				minzoom: 15,
				layout: { 'line-join': 'round', visibility: 'visible' },
				paint: {
					'line-color': 'hsl(0, 0%, 95%)',
					'line-width': {
						base: 1.3,
						stops: [
							[15, 0.5],
							[16, 1],
							[20, 5],
						],
					},
					'line-dasharray': [2, 2],
				},
				filter: ['all', ['==', 'class', 'rail'], ['==', 'brunnel', 'tunnel']],
			},
			{
				id: 'Pier',
				type: 'fill',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				layout: { visibility: 'visible' },
				paint: { 'fill-color': 'hsl(38, 50%, 97%)', 'fill-antialias': true },
				metadata: {},
				filter: ['all', ['==', '$type', 'Polygon'], ['==', 'class', 'pier']],
			},
			{
				id: 'Pier road',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				layout: {
					'line-cap': 'round',
					'line-join': 'round',
					visibility: 'visible',
				},
				paint: {
					'line-color': 'hsl(30,25%,98%)',
					'line-width': {
						base: 1.2,
						stops: [
							[15, 1],
							[17, 4],
						],
					},
				},
				metadata: {},
				filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'pier']],
			},
			{
				id: 'Bridge',
				type: 'fill',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				layout: { visibility: 'visible' },
				paint: {
					'fill-color': 'hsl(30,25%,98%)',
					'fill-opacity': 0.5,
					'fill-antialias': true,
				},
				metadata: {},
				filter: [
					'all',
					['==', '$type', 'Polygon'],
					['in', 'brunnel', 'bridge'],
				],
			},
			{
				id: 'Road network outline',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				minzoom: 6,
				layout: {
					'line-cap': 'butt',
					'line-join': 'round',
					visibility: 'visible',
				},
				paint: {
					'line-color': 'hsl(0, 0%, 85%)',
					'line-width': [
						'interpolate',
						['linear', 2],
						['zoom'],
						4,
						0.5,
						7,
						0.5,
						10,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 0, 2.5],
							['trunk', 'primary'],
							2.4,
							0,
						],
						12,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 2, 6],
							['trunk', 'primary'],
							3,
							['secondary', 'tertiary'],
							2,
							['minor', 'service', 'track'],
							0,
							0.5,
						],
						14,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 5, 8],
							['trunk'],
							4,
							['primary'],
							6,
							['secondary'],
							6,
							['tertiary'],
							4,
							['minor', 'service', 'track'],
							3,
							3,
						],
						16,
						[
							'match',
							['get', 'class'],
							['motorway', 'trunk', 'primary'],
							10,
							['secondary'],
							9,
							['tertiary'],
							8,
							['minor', 'service', 'track'],
							6,
							6,
						],
						20,
						[
							'match',
							['get', 'class'],
							['motorway', 'trunk', 'primary'],
							26,
							['secondary'],
							26,
							['tertiary'],
							26,
							['minor', 'service', 'track'],
							18,
							18,
						],
					],
					'line-opacity': 1,
				},
				metadata: {},
				filter: [
					'all',
					['!=', 'brunnel', 'tunnel'],
					[
						'!in',
						'class',
						'ferry',
						'rail',
						'transit',
						'pier',
						'bridge',
						'path',
						'aerialway',
						'motorway_construction',
						'trunk_construction',
						'primary_construction',
						'secondary_construction',
						'tertiary_construction',
						'minor_construction',
						'service_construction',
						'track_construction',
					],
				],
			},
			{
				id: 'Road network',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				minzoom: 6,
				layout: {
					'line-cap': 'butt',
					'line-join': 'round',
					visibility: 'visible',
				},
				paint: {
					'line-color': 'hsl(0, 0%, 100%)',
					'line-width': [
						'interpolate',
						['linear', 2],
						['zoom'],
						5,
						0.5,
						6,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'brunnel'], ['bridge'], 0, 1],
							['trunk', 'primary'],
							0,
							0,
						],
						10,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 0, 2.5],
							['trunk', 'primary'],
							1.5,
							1,
						],
						12,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 1, 4],
							['trunk'],
							2.5,
							['primary'],
							2.5,
							['secondary', 'tertiary'],
							1.5,
							['minor', 'service', 'track'],
							0,
							1,
						],
						14,
						[
							'match',
							['get', 'class'],
							['motorway'],
							['match', ['get', 'ramp'], 1, 5, 6],
							['trunk'],
							3,
							['primary'],
							5,
							['secondary'],
							4,
							['tertiary'],
							3,
							['minor', 'service', 'track'],
							2,
							2,
						],
						16,
						[
							'match',
							['get', 'class'],
							['motorway', 'trunk', 'primary'],
							8,
							['secondary'],
							7,
							['tertiary'],
							6,
							['minor', 'service', 'track'],
							4,
							4,
						],
						20,
						[
							'match',
							['get', 'class'],
							['motorway', 'trunk', 'primary'],
							24,
							['secondary'],
							24,
							['tertiary'],
							24,
							['minor', 'service', 'track'],
							16,
							16,
						],
					],
				},
				metadata: {},
				filter: [
					'all',
					['!=', 'brunnel', 'tunnel'],
					[
						'!in',
						'class',
						'ferry',
						'rail',
						'transit',
						'pier',
						'bridge',
						'path',
						'aerialway',
						'motorway_construction',
						'trunk_construction',
						'primary_construction',
						'secondary_construction',
						'tertiary_construction',
						'minor_construction',
						'service_construction',
						'track_construction',
					],
				],
			},
			{
				id: 'Path outline',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				minzoom: 16,
				maxzoom: 22,
				layout: {
					'line-cap': 'round',
					'line-join': 'round',
					visibility: 'visible',
				},
				paint: {
					'line-blur': {
						stops: [
							[16, 1],
							[22, 2],
						],
					},
					'line-color': 'hsl(0, 0%, 100%)',
					'line-width': [
						'interpolate',
						['linear'],
						['zoom'],
						15,
						1.5,
						16,
						2,
						18,
						6,
						22,
						12,
					],
					'line-opacity': {
						stops: [
							[15, 0],
							[22, 0.5],
						],
					},
				},
				filter: ['all', ['in', 'class', 'path', 'track'], ['!has', 'brunnel']],
			},
			{
				id: 'Path',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				minzoom: 14,
				maxzoom: 22,
				layout: {
					'line-cap': 'round',
					'line-join': 'round',
					visibility: 'visible',
				},
				paint: {
					'line-color': 'hsl(0, 0%, 80%)',
					'line-width': [
						'interpolate',
						['linear'],
						['zoom'],
						14,
						0.7,
						16,
						0.8,
						18,
						1,
						22,
						2,
					],
					'line-opacity': 1,
					'line-dasharray': [0.5, 2],
				},
				filter: ['all', ['in', 'class', 'path', 'track'], ['!has', 'brunnel']],
			},
			{
				id: 'Railway',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				minzoom: 10,
				layout: { 'line-join': 'round', visibility: 'visible' },
				paint: {
					'line-color': 'hsl(0, 0%, 80%)',
					'line-width': {
						base: 1.3,
						stops: [
							[13, 0.5],
							[14, 1],
							[15, 1],
							[16, 3],
							[21, 7],
						],
					},
				},
				filter: ['all', ['==', 'class', 'rail'], ['!=', 'brunnel', 'tunnel']],
			},
			{
				id: 'Railway dash',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'transportation',
				minzoom: 15,
				layout: { 'line-join': 'round', visibility: 'visible' },
				paint: {
					'line-color': 'hsl(0, 0%, 100%)',
					'line-width': {
						base: 1.3,
						stops: [
							[15, 0.5],
							[16, 1],
							[20, 5],
						],
					},
					'line-dasharray': [2, 2],
				},
				filter: ['all', ['==', 'class', 'rail'], ['!=', 'brunnel', 'tunnel']],
			},
			{
				id: 'Building',
				type: 'fill',
				source: 'maptiler_planet',
				'source-layer': 'building',
				layout: { visibility: 'visible' },
				paint: {
					'fill-color': {
						stops: [
							[13, 'hsl(0,0%,92%)'],
							[16, 'hsl(0,0%,85%)'],
						],
					},
					'fill-antialias': true,
				},
			},
			{
				id: 'Building top',
				type: 'fill',
				source: 'maptiler_planet',
				'source-layer': 'building',
				layout: { visibility: 'visible' },
				paint: {
					'fill-color': 'hsl(0, 0%, 92%)',
					'fill-opacity': {
						base: 1,
						stops: [
							[13, 0],
							[16, 1],
						],
					},
					'fill-translate': {
						base: 1,
						stops: [
							[14, [0, 0]],
							[16, [-2, -2]],
						],
					},
					'fill-outline-color': {
						stops: [
							[12, 'hsl(0, 0%, 92%)'],
							[14, 'hsl(0, 0%, 92%)'],
							[18, 'hsl(0,0%,76%)'],
						],
					},
				},
			},
			{
				id: 'Other border',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'boundary',
				minzoom: 5,
				maxzoom: 8,
				layout: { visibility: 'visible' },
				paint: {
					'line-color': 'hsl(356, 32%, 83%)',
					'line-width': [
						'interpolate',
						['linear', 1],
						['zoom'],
						3,
						['case', ['<=', ['get', 'admin_level'], 6], 0.5, 0],
						4,
						['case', ['<=', ['get', 'admin_level'], 6], 0.75, 0],
						8,
						['case', ['<=', ['get', 'admin_level'], 6], 1.1, 0],
						12,
						['case', ['<=', ['get', 'admin_level'], 6], 2, 1.5],
						16,
						['case', ['<=', ['get', 'admin_level'], 6], 3, 2],
					],
					'line-opacity': 1,
				},
				filter: [
					'all',
					['in', 'admin_level', 3, 4, 5, 6, 7, 8, 9, 10],
					['==', 'maritime', 0],
				],
			},
			{
				id: 'Other border dash',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'boundary',
				minzoom: 8,
				maxzoom: 22,
				layout: { visibility: 'visible' },
				paint: {
					'line-color': 'hsl(356, 32%, 83%)',
					'line-width': [
						'interpolate',
						['linear', 1],
						['zoom'],
						3,
						['case', ['<=', ['get', 'admin_level'], 6], 0.5, 0],
						4,
						['case', ['<=', ['get', 'admin_level'], 6], 0.75, 0],
						8,
						['case', ['<=', ['get', 'admin_level'], 6], 1.25, 0],
						12,
						['case', ['<=', ['get', 'admin_level'], 6], 2, 1.25],
						16,
						['case', ['<=', ['get', 'admin_level'], 6], 3, 2],
						22,
						['case', ['<=', ['get', 'admin_level'], 6], 6, 4],
					],
					'line-opacity': 1,
					'line-dasharray': {
						stops: [
							[8, [3, 1]],
							[12, [2, 2, 6, 2]],
						],
					},
				},
				filter: [
					'all',
					['in', 'admin_level', 3, 4, 5, 6, 7, 8, 9, 10],
					['==', 'maritime', 0],
				],
			},
			{
				id: 'Disputed border',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'boundary',
				minzoom: 0,
				layout: {
					'line-cap': 'round',
					'line-join': 'round',
					visibility: 'visible',
				},
				paint: {
					'line-color': 'hsl(354, 33%, 88%)',
					'line-width': [
						'interpolate',
						['linear'],
						['zoom'],
						1,
						0.75,
						3,
						1,
						6,
						1.5,
						12,
						5,
					],
					'line-opacity': 1,
					'line-dasharray': [2, 3],
				},
				filter: [
					'all',
					['==', 'admin_level', 2],
					['==', 'maritime', 0],
					['==', 'disputed', 1],
				],
			},
			{
				id: 'Country border',
				type: 'line',
				source: 'maptiler_planet',
				'source-layer': 'boundary',
				minzoom: 0,
				layout: {
					'line-cap': 'round',
					'line-join': 'round',
					visibility: 'visible',
				},
				paint: {
					'line-color': [
						'interpolate',
						['linear'],
						['zoom'],
						4,
						'hsl(354, 33%, 88%)',
						6,
						'hsl(356,23%,84%)',
					],
					'line-width': [
						'interpolate',
						['linear'],
						['zoom'],
						1,
						0.75,
						3,
						1.5,
						7,
						2.2,
						12,
						3.5,
						22,
						8,
					],
					'line-opacity': 1,
				},
				filter: [
					'all',
					['==', 'admin_level', 2],
					['==', 'maritime', 0],
					['==', 'disputed', 0],
				],
			},
			{
				id: 'Ocean labels',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'water_name',
				minzoom: 0,
				maxzoom: 4,
				layout: {
					'text-font': ['Metropolis Semi Bold Italic', 'Noto Sans Bold'],
					'text-size': ['interpolate', ['linear', 1], ['zoom'], 1, 11, 4, 14],
					'text-field': ['coalesce', ...maptilerNameExpression],
					visibility: 'visible',
					'text-padding': 2,
					'text-max-width': 6,
					'text-transform': 'uppercase',
					'symbol-placement': 'point',
					'text-line-height': 1.2,
					'text-allow-overlap': false,
					'text-letter-spacing': 0.1,
					'text-pitch-alignment': 'auto',
					'text-ignore-placement': false,
					'text-rotation-alignment': 'auto',
				},
				paint: {
					'text-color': 'hsl(190,9%,63%)',
					'text-opacity': [
						'step',
						['zoom'],
						0,
						1,
						['match', ['get', 'class'], ['ocean'], 1, 0],
						4,
						1,
					],
				},
				filter: ['all', ['==', 'class', 'ocean'], ['has', 'name']],
			},
			{
				id: 'Sea labels',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'water_name',
				minzoom: 3,
				maxzoom: 22,
				layout: {
					'text-font': ['Metropolis Semi Bold Italic', 'Noto Sans Bold'],
					'text-size': [
						'interpolate',
						['linear', 1],
						['zoom'],
						3,
						9,
						9,
						16,
						14,
						20,
					],
					'text-field': ['coalesce', ...maptilerNameExpression],
					visibility: 'visible',
					'text-padding': 2,
					'text-max-width': 6,
					'text-transform': 'uppercase',
					'symbol-placement': 'point',
					'text-line-height': 1.2,
					'text-allow-overlap': false,
					'text-letter-spacing': 0.1,
					'text-pitch-alignment': 'auto',
					'text-ignore-placement': false,
					'text-rotation-alignment': 'auto',
				},
				paint: { 'text-color': 'hsl(190,9%,63%)', 'text-opacity': 1 },
				filter: ['all', ['==', 'class', 'sea'], ['has', 'name']],
			},
			{
				id: 'Lakeline labels',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'water_name',
				layout: {
					'text-font': ['Metropolis Semi Bold Italic', 'Noto Sans Bold'],
					'text-size': [
						'interpolate',
						['linear'],
						['zoom'],
						9,
						12,
						14,
						16,
						18,
						20,
					],
					'text-field': ['coalesce', ...maptilerNameExpression],
					visibility: 'visible',
					'symbol-spacing': 350,
					'symbol-placement': 'line',
					'text-line-height': 1.2,
					'text-pitch-alignment': 'auto',
					'text-rotation-alignment': 'auto',
				},
				paint: { 'text-color': 'hsl(190,9%,63%)' },
				filter: ['has', 'name'],
			},
			{
				id: 'Road labels',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'transportation_name',
				minzoom: 14,
				layout: {
					'text-font': ['Metropolis Semi Bold', 'Noto Sans Bold'],
					'text-size': [
						'interpolate',
						['linear'],
						['zoom'],
						14,
						['match', ['get', 'class'], ['primary'], 10, 7],
						15,
						[
							'match',
							['get', 'class'],
							['primary'],
							10,
							['secondary', 'tertiary'],
							9,
							7,
						],
						16,
						[
							'match',
							['get', 'class'],
							['primary', 'secondary', 'tertiary'],
							11,
							10,
						],
						18,
						[
							'match',
							['get', 'class'],
							['primary', 'secondary', 'tertiary'],
							13,
							12,
						],
					],
					'text-field': ['coalesce', ...maptilerNameExpression],
					visibility: 'visible',
					'text-justify': 'center',
					'symbol-spacing': {
						stops: [
							[6, 200],
							[16, 250],
							[20, 250],
							[22, 600],
						],
					},
					'symbol-placement': 'line',
					'symbol-avoid-edges': false,
					'text-letter-spacing': [
						'interpolate',
						['linear', 1],
						['zoom'],
						13,
						0,
						16,
						['match', ['get', 'class'], 'primary', 0.2, 0.1],
					],
					'text-pitch-alignment': 'auto',
					'text-rotation-alignment': 'auto',
				},
				paint: {
					'text-color': 'hsl(204, 11%, 47%)',
					'text-opacity': [
						'step',
						['zoom'],
						1,
						14,
						['match', ['get', 'class'], ['primary'], 1, 0],
						15,
						[
							'match',
							['get', 'class'],
							['primary', 'secondary', 'tertiary'],
							1,
							0,
						],
						16,
						1,
					],
					'text-halo-blur': 0,
					'text-halo-color': 'hsl(0,0%,100%)',
					'text-halo-width': 1.5,
				},
				filter: [
					'in',
					'class',
					'primary',
					'secondary',
					'tertiary',
					'minor',
					'service',
				],
			},
			{
				id: 'Place labels',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'place',
				minzoom: 13,
				maxzoom: 22,
				layout: {
					'text-font': ['Metropolis Semi Bold', 'Noto Sans Bold'],
					'text-size': [
						'interpolate',
						['linear', 1],
						['zoom'],
						12,
						10,
						13,
						[
							'match',
							['get', 'class'],
							['suburb', 'neighborhood', 'neighbourhood'],
							12,
							11,
						],
						14,
						[
							'match',
							['get', 'class'],
							['suburb', 'neighborhood', 'neighbourhood'],
							12,
							11,
						],
						16,
						[
							'match',
							['get', 'class'],
							['suburb', 'neighborhood', 'neighbourhood'],
							14,
							13,
						],
					],
					'text-field': ['coalesce', ...maptilerNameExpression],
					visibility: 'visible',
					'text-anchor': 'center',
					'text-offset': [0.2, 0.2],
					'text-max-width': 10,
					'text-transform': 'none',
					'text-keep-upright': true,
				},
				paint: {
					'text-color': 'hsl(204, 11%, 47%)',
					'text-opacity': [
						'step',
						['zoom'],
						0,
						13,
						[
							'match',
							['get', 'class'],
							['suburb', 'neighborhood', 'neighbourhood'],
							1,
							0,
						],
						14,
						1,
					],
					'text-halo-blur': 0,
					'text-halo-color': 'hsl(0, 0%, 100%)',
					'text-halo-width': 1.5,
				},
				filter: [
					'!in',
					'class',
					'city',
					'continent',
					'country',
					'province',
					'state',
					'town',
					'village',
				],
			},
			{
				id: 'Village labels',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'place',
				minzoom: 5,
				maxzoom: 22,
				layout: {
					'text-font': ['Metropolis Semi Bold', 'Noto Sans Bold'],
					'text-size': [
						'interpolate',
						['linear', 1],
						['zoom'],
						12,
						10,
						13,
						12,
						14,
						14,
						16,
						13,
					],
					'text-field': '{name}',
					visibility: 'visible',
					'text-anchor': 'center',
					'text-offset': [0.2, 0.2],
					'text-max-width': 10,
					'text-transform': 'none',
					'text-keep-upright': true,
				},
				paint: {
					'text-color': 'hsl(204, 11%, 47%)',
					'text-opacity': 1,
					'text-halo-blur': 0,
					'text-halo-color': 'hsl(0, 0%, 100%)',
					'text-halo-width': 1.5,
				},
				filter: ['==', 'class', 'village'],
			},
			{
				id: 'Town labels',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'place',
				minzoom: 4,
				maxzoom: 16,
				layout: {
					'text-font': ['Metropolis Semi Bold', 'Noto Sans Bold'],
					'text-size': [
						'interpolate',
						['linear'],
						['zoom'],
						10,
						11,
						13,
						14,
						14,
						15,
					],
					'text-field': ['coalesce', ...maptilerNameExpression],
					visibility: 'visible',
					'text-anchor': 'center',
					'text-offset': [0.2, 0.2],
					'text-max-width': 10,
					'text-transform': 'none',
					'text-keep-upright': true,
				},
				paint: {
					'text-color': 'hsl(204, 11%, 47%)',
					'text-halo-blur': 0,
					'text-halo-color': 'hsl(0,0%,100%)',
					'text-halo-width': 1.5,
				},
				filter: ['==', 'class', 'town'],
			},
			{
				id: 'State labels',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'place',
				minzoom: 5,
				maxzoom: 8,
				layout: {
					'text-font': ['Metropolis Semi Bold', 'Noto Sans Bold'],
					'text-size': [
						'interpolate',
						['linear', 1],
						['zoom'],
						5,
						['match', ['get', 'rank'], 1, 10, 10],
						11,
						['match', ['get', 'rank'], 1, 16, 16],
					],
					'text-field': ['coalesce', ...maptilerNameExpression],
					visibility: 'visible',
					'text-max-width': 9,
					'text-transform': 'uppercase',
					'text-allow-overlap': false,
				},
				paint: {
					'text-color': 'hsl(204, 11%, 47%)',
					'text-opacity': [
						'step',
						['zoom'],
						0,
						3,
						['match', ['get', 'rank'], 1, 0.85, 0],
						4,
						['case', ['<=', ['get', 'rank'], 1], 0.75, 0],
						5,
						['case', ['<=', ['get', 'rank'], 3], 0.75, 0],
						8,
						['match', ['get', 'rank'], 4, 0.75, 0],
						11,
						0,
					],
					'text-halo-blur': 0,
					'text-halo-color': 'hsl(30,25%,98%)',
					'text-halo-width': 1.5,
				},
				filter: ['all', ['==', 'class', 'state'], ['==', 'rank', 1]],
			},
			{
				id: 'City labels',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'place',
				minzoom: 4,
				maxzoom: 14,
				layout: {
					'text-font': ['Metropolis Semi Bold', 'Noto Sans Bold'],
					'text-size': [
						'interpolate',
						['linear', 1],
						['zoom'],
						5,
						['case', ['>=', ['get', 'rank'], 6], 11, 12],
						9,
						['case', ['>=', ['get', 'rank'], 6], 12, 14],
						13,
						['case', ['>=', ['get', 'rank'], 6], 16, 18],
						14,
						['case', ['>=', ['get', 'rank'], 6], 20, 22],
					],
					'text-field': ['coalesce', ...maptilerNameExpression],
					visibility: 'visible',
					'text-anchor': 'center',
					'text-offset': [0.2, 0.2],
					'text-max-width': 10,
					'text-transform': 'none',
					'text-keep-upright': false,
				},
				paint: {
					'text-color': 'hsl(204, 11%, 47%)',
					'text-halo-blur': 0,
					'text-halo-color': 'hsl(0,0%,100%)',
					'text-halo-width': 1.5,
				},
				filter: ['all', ['==', 'class', 'city'], ['has', 'rank']],
			},
			{
				id: 'Country labels',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'place',
				minzoom: 2,
				maxzoom: 10,
				layout: {
					'text-font': ['Metropolis Semi Bold', 'Noto Sans Bold'],
					'text-size': [
						'interpolate',
						['linear', 1],
						['zoom'],
						2,
						['case', ['<=', ['get', 'rank'], 2], 11, 0],
						3,
						['case', ['<=', ['get', 'rank'], 2], 11, 9],
						4,
						['case', ['<=', ['get', 'rank'], 2], 12, 10],
						5,
						['case', ['<=', ['get', 'rank'], 2], 13, 11],
						6,
						['case', ['<=', ['get', 'rank'], 2], 14, 12],
						7,
						['case', ['<=', ['get', 'rank'], 2], 14, 13],
					],
					'text-field': ['coalesce', ...maptilerNameExpression],
					visibility: 'visible',
					'text-transform': 'uppercase',
				},
				paint: {
					'text-color': 'hsl(204, 11%, 47%)',
					'text-opacity': [
						'step',
						['zoom'],
						1,
						2,
						['case', ['<=', ['get', 'rank'], 2], 1, 0],
						3,
						1,
					],
					'text-halo-blur': 0,
					'text-halo-color': 'hsl(0,0%,100%)',
					'text-halo-width': 1.5,
				},
				filter: ['all', ['==', 'class', 'country'], ['has', 'iso_a2']],
			},
			{
				id: 'Continent labels',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'place',
				minzoom: 0,
				maxzoom: 2,
				layout: {
					'text-font': ['Metropolis Semi Bold', 'Noto Sans Bold'],
					'text-size': 13,
					'text-field': ['coalesce', ...maptilerNameExpression],
					visibility: 'visible',
					'text-justify': 'center',
					'text-max-width': 9,
					'text-transform': 'uppercase',
					'text-keep-upright': false,
					'text-letter-spacing': 0.1,
				},
				paint: {
					'text-color': 'hsl(204, 11%, 47%)',
					'text-halo-blur': 0,
					'text-halo-color': 'hsl(0,0%,100%)',
					'text-halo-width': 1.5,
				},
				filter: ['==', 'class', 'continent'],
			},
			{
				id: 'Other POI',
				type: 'symbol',
				source: 'maptiler_planet',
				'source-layer': 'poi',
				minzoom: 13,
				layout: {
					'icon-size': 1,
					'text-font': ['RobotoRegular-NotoSansRegular'],
					'text-size': {
						stops: [
							[12, 10],
							[16, 12],
							[22, 14],
						],
					},
					'icon-image': [
						'coalesce',
						['image', ['get', 'subclass']],
						['image', ['get', 'class']],
						['image', 'dot'],
					],
					'text-field': ['coalesce', ...maptilerNameExpression],
					visibility: 'visible',
					'text-anchor': 'top',
					'text-offset': [0, 0.8],
					'text-padding': 2,
					'text-max-width': 8,
					'icon-allow-overlap': false,
				},
				paint: {
					'text-color': [
						'match',
						['get', 'class'],
						[
							'aerialway',
							'bus',
							'bicycle_rental',
							'entrance',
							'ferry_terminal',
							'harbor',
						],
						'hsl(215,83%,53%)',
						['hospital'],
						'hsl(6,94%,35%)',
						'hsl(17,17%,38%)',
					],
					'icon-opacity': [
						'step',
						['zoom'],
						0,
						15,
						[
							'match',
							['get', 'class'],
							[
								'aerialway',
								'castle',
								'cemetery',
								'diplomatic',
								'ferry_terminal',
								'harbor',
								'hospital',
								'stadium',
								'place_of_worship',
								'zoo',
							],
							1,
							0,
						],
						16,
						[
							'match',
							['get', 'class'],
							[
								'castle',
								'cemetery',
								'town_hall',
								'diplomatic',
								'ferry_terminal',
								'hospital',
								'stadium',
								'college',
								'university',
								'place_of_worship',
								'zoo',
								'museum',
								'school',
								'parking',
								'lodging',
							],
							1,
							0,
						],
						17,
						1,
						22,
						1,
					],
					'text-opacity': [
						'step',
						['zoom'],
						0,
						15,
						[
							'match',
							['get', 'class'],
							[
								'castle',
								'courthouse',
								'diplomatic',
								'ferry_terminal',
								'aerialway',
								'harbor',
								'stadium',
								'university',
								'hospital',
								'place_of_worship',
								'zoo',
							],
							1,
							0,
						],
						16,
						[
							'match',
							['get', 'class'],
							[
								'castle',
								'cemetery',
								'town_hall',
								'diplomatic',
								'harbor',
								'college',
								'university',
								'ferry_terminal',
								'hospital',
								'stadium',
								'park',
								'place_of_worship',
								'zoo',
								'museum',
								'school',
								'lodging',
							],
							1,
							0,
						],
						17,
						1,
						22,
						1,
					],
					'text-halo-blur': 0.5,
					'text-halo-color': 'hsl(0,0%,100%)',
					'text-halo-width': 1,
				},
				metadata: {},
				filter: [
					'all',
					['has', 'name'],
					['!in', 'class', 'hospital', 'parking', 'railway'],
				],
			},
		],
		glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${key}`,
		sprite: 'https://api.maptiler.com/maps/dataviz/sprite',
		bearing: 0,
		pitch: 0,
		center: [0, 0],
		zoom: 1,
	}
}
