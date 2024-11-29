 import { useEffect } from 'react'
 import { layersWithOsmId } from './clickableLayers'
 
 export default function useHoverOnMapFeatures(map) {
 	useEffect(() => {
 		if (!map) return
 
 		setUpHover(map)
 	}, [map])
 }
 
 // Taken from https://github.com/zbycz/osmapp/blob/master/src/components/Map/behaviour/useInitMap.tsx
 const setUpHover = (map) => {
 	let lastHover = null
 
 	const setHoverOn = (feature) =>
 		feature?.id && map.setFeatureState(feature, { hover: true })
 	const setHoverOff = (feature) =>
 		feature?.id && map.setFeatureState(feature, { hover: false })
 
 	const onMouseMove = (e) => {
 		if (e.features && e.features.length > 0) {
 			const feature = e.features[0]
 			if (feature !== lastHover) {
 				setHoverOff(lastHover)
 				setHoverOn(feature)
 				lastHover = feature
 				map.getCanvas().style.cursor = 'pointer' // eslint-disable-line no-param-reassign
 			}
 		}
 	}
 
 	const onMouseLeave = () => {
 		setHoverOff(lastHover)
 		lastHover = null
 		// TODO delay 200ms
 		map.getCanvas().style.cursor = '' // eslint-disable-line no-param-reassign
 	}
 
 	try {
 		layersWithOsmId.forEach((layer) => {
 			map.on('mousemove', layer, onMouseMove)
 			map.on('mouseleave', layer, onMouseLeave)
 		})
 	} catch (e) {
 		console.log('Caught error useHoverOnMapFeatures', e)
 	}
 }
