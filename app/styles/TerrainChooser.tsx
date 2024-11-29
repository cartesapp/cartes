 import { safeRemove } from '@/app/effects/utils'
 import Image from 'next/image'
 import reliefIcon from '@/public/relief.svg'
 import reliefIconChecked from '@/public/relief-choisi.svg'
 import { StyleElementChooserWrapper } from './PanoramaxChooser'
 import { useEffect } from 'react'
 import { pmtilesServerUrl } from '../serverUrls'
 import terrainLayers, { contourLayers, hillshadeLayers } from './terrainLayers'
 
 export default function TerrainChooser({
 	searchParams,
 	setSearchParams,
 	setZoom,
 	zoom,
 	styleKey,
 }) {
 	if (styleKey !== 'france') return
 
 	const reliefChecked = searchParams.relief === 'oui'
 
 	return (
 		<>
 			<StyleElementChooserWrapper>
 				<label title="Afficher sur la carte les lignes de niveau">
 					<input
 						type="checkbox"
 						checked={reliefChecked}
 						onChange={() => {
 							if (searchParams.relief === 'oui')
 								setSearchParams({ relief: undefined })
 							else {
 								setSearchParams({ relief: 'oui' })
 							}
 						}}
 					/>
 					<span>
 						<Image
 							src={!reliefChecked ? reliefIcon : reliefIconChecked}
 							alt="Logo représentant des lignes de niveau"
 						/>
 						Relief
 					</span>
 				</label>
 			</StyleElementChooserWrapper>
 		</>
 	)
 }
 
 export function AddTerrain({ map, active }) {
 	useEffect(() => {
 		if (!active) return
 
 		map.addSource('terrain-rgb', {
 			tiles: [
 				'pmtiles://https://data.source.coop/smartmaps/gel/gel.pmtiles/{z}/{x}/{y}.webp',
 			],
 			type: 'raster-dem',
 			tileSize: 512,
 			minzoom: 2,
 			maxzoom: 12,
 		})
 		map.addSource('contours', {
 			type: 'vector',
 			url: 'pmtiles://' + pmtilesServerUrl + '/contour-lines.pmtiles',
 			minzoom: 13,
 		})
 
 		terrainLayers.map((layer) => map.addLayer(layer))
 
 		return () => {
 			safeRemove(map)(
 				terrainLayers.map((layer) => layer.id),
 				['contours', 'terrain-rgb']
 			)
 		}
 	}, [map, active])
 	return null
 }
