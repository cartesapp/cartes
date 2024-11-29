 import { useEffect, useState } from 'react'
 import Route from './Route'
 import { sortBy } from '@/components/utils/utils'
 
 export const isNotTransportStop = (tags) => {
 	console.log('indigo stop tags', tags)
 	return !tags || !['platform', 'stop_position'].includes(tags.public_transport)
 }
 
 export const findStopId = (tags) => {
 	console.log('indigo stop tags', tags)
 	// ref:MobiBreizh = ILLENOO2:13602
 	// ref:STAR = 1320
 	// ref:bzh:IOAD = MARCHE
 
 	if (tags.network) {
 		const ref = tags.ref || tags['ref' + ':' + tags.network.toUpperCase()]
 		return tags.network.toUpperCase() + ':' + ref
 	}
 
 	const ref = Object.entries(tags).find(([k, v]) => k.match(/ref(\:FR)?\:.+/g))
 	if (!ref) return null
 	if (ref[1].split(':').length === 2) return ref[1]
 	const splits = ref[0].split(':')
 	const network = splits.length === 3 ? splits[2] : splits[1]
 	const stopId = ref[1].includes(network.toUpperCase())
 		? ref[1]
 		: network.toUpperCase() + ':' + ref[1]
 	return stopId
 }
 export default function Stop({ tags, data }) {
 	console.log('olive bus data', data, 'tags', tags)
 	if (!data || !data.routes) return null
 
 	return (
 		<div>
 			<ul
 				css={css`
 					list-style-type: none;
 				`}
 			>
 				{sortBy((route) => -route.tripsCount)(data.routes).map((route) => (
 					<Route
 						key={route.route_id}
 						route={route}
 						stops={enrichStopsWithTrip(data.trips, data.stops).filter(
 							(stop) => stop.trip.route_id === route.route_id
 						)}
 					/>
 				))}
 			</ul>
 		</div>
 	)
 }
 
 const enrichStopsWithTrip = (trips, stops) =>
 	stops.map((stop) => {
 		// We thought one trip can be shared with multiple stops, hence
 		// transmitting less data weight with a trip dictionnary rather than a
 		// stop.trip property
 		const trip = trips.find((t) => t.trip_id === stop.trip_id)
 		return { ...stop, trip }
 	})
 
 export const transportKeys = ['ref:FR:STAR']
