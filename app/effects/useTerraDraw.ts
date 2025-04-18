import { useEffect } from 'react'
import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw'

export default function useTerraDraw(map, dessin) {
	useEffect(() => {
		if (!map) return
		if (!dessin) return

		// As default, all Terra Draw modes are enabled,
		// you can disable options if you don't want to use them.
		const control = new MaplibreTerradrawControl({
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
		})

		map.addControl(control, 'top-left')
		return () => {
			try {
				map.removeControl(control)
			} catch (e) {
				console.log('Trying to remove terrain 3D control failed', e)
			}
		}
	}, [map, dessin])
}
