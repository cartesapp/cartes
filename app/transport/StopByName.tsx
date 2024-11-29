 import { sortBy } from '@/components/utils/utils'
 import Stop from './stop/Stop'
 import useTransportStopData from './useTransportStopData'
 import { useMemo } from 'react'
 
 export default function StopByName({ stopName, data }) {
 	const stopIds = useMemo(
 		() =>
 			data
 				.map(([agencyId, { features }]) =>
 					features.filter(
 						(feature) =>
 							feature.geometry.type === 'Point' &&
 							feature.properties.name === stopName
 					)
 				)
 
 				.flat()
 				.map((feature) => feature.properties.ids)
 				.flat(),
 		[stopName]
 	)
 
 	console.log('purple data', data, stopIds)
 
 	const entries = useTransportStopData(null, stopIds.length ? stopIds : null)
 	console.log('purple trips', entries)
 	const sorted = sortBy(([, { trips }]) => -trips.length)(entries)
 
 	return sorted.map(([id, data]) => <StopById key={id} data={data} />)
 }
 
 const StopById = ({ data }) => {
 	console.log('olive stopbyid data', data)
 
 	return <Stop data={data} />
 }
