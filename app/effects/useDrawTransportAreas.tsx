 import { filterMapEntries } from '@/components/utils/utils'
 import { useEffect } from 'react'
 import { getAgencyFilter } from '../transport/AgencyFilter'
 import { safeRemove } from './utils'
 
 const id = 'transport-areas'
 const areasId = id + '-fill'
 const bordersId = id + '-border'
 
 export default function useDrawTransportAreas(map, areas, agencyFilter) {
 	const areasHash =
 		areas &&
 		Object.entries(areas)
 			.map(([k]) => k)
 			.join('<|>') +
 			':::' +
 			agencyFilter
 
 	useEffect(() => {
 		if (!map || !areas) return
 
 		const agencyFilterFunction = getAgencyFilter((key) => agencyFilter === key)
 		const areasToDraw = filterMapEntries(areas, (k, v) =>
 			agencyFilterFunction.filter(v.properties)
 		)
 
 		const data = {
 			type: 'FeatureCollection',
 			features: Object.entries(areasToDraw)
 				.map(([id, polygon]) => polygon)
 				.filter(Boolean),
 		}
 
 		map.addSource(id, { type: 'geojson', data })
 		map.addLayer({
 			source: id,
 			type: 'fill',
 			id: areasId,
 			paint: { 'fill-color': '#57bff5', 'fill-opacity': 0.06 },
 		})
 		map.addLayer({
 			source: id,
 			type: 'line',
 			id: bordersId,
 			paint: {
 				'line-color': '#57bff5',
 				'line-opacity': 0.3,
 				'line-width': 1,
 			},
 		})
 		return () => {
 			console.log('orange will safe remove', areasId, bordersId, id)
 			safeRemove(map)([areasId, bordersId], [id])
 		}
 	}, [map, areasHash])
 }
