import { useEffect, useState } from 'react'
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css'
import { MaplibreMeasureControl } from '@watergis/maplibre-gl-terradraw'

const createControl = (storeControl) => {
	const control = new MaplibreMeasureControl({
		modes: [
			'render',
			'point',
			'linestring',
			'polygon',
			'rectangle',
			'circle',
			'freehand',
			'angled-rectangle',
			'sensor',
			'sector',
			'select',
			'delete-selection',
			'delete',
			'download',
		],
		open: true,
		distanceUnit: 'kilometers',
		areaUnit: 'metric',
		computeElevation: true,
	})

	control.fontGlyphs = ['RobotoRegular-NotoSansRegular']

	storeControl(control)
	return control
}

export default function useTerraDraw(map, dessin) {
	const [storedControl, storeControl] = useState(null)
	useEffect(() => {
		if (!map) return
		if (!dessin) return

		const control = storedControl || createControl(storeControl)
		map.addControl(control, 'top-left')

		return () => {
			try {
				map.removeControl(control)
			} catch (e) {
				console.log('Trying to remove terrain 3D control failed', e)
			}
		}
	}, [map, dessin, storedControl])
}
