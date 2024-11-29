 import useSetSearchParams from '@/components/useSetSearchParams'
 import Link from 'next/link'
 import Image from 'next/image'
 import { PlaceButton } from './PlaceButtonsUI'
 import { encodePlace } from './utils'
 import turfDistance from '@turf/distance'
 import { computeHumanDistance } from './RouteRésumé'
 import { buildAddress } from '@/components/osm/buildAddress'
 
 export const geoFeatureToDestination = (feature) => {
 	if (feature.properties.id) {
 		return buildAllezPart(
 			feature.properties.name || buildAddress(feature.properties, false),
 			encodePlace(feature.properties.type, feature.properties.id),
 			+feature.geometry.coordinates[0],
 			+feature.geometry.coordinates[1]
 		)
 	}
 	if (feature.properties.osm_id) {
 		const name = buildAddress(feature.properties, true)
 		return buildAllezPart(
 			name,
 			encodePlace(feature.properties.osm_type, feature.properties.osm_id),
 			+feature.geometry.coordinates[0],
 			+feature.geometry.coordinates[1]
 		)
 	}
 	if (feature.coordinates) {
 		return buildAllezPart(
 			'Point sur la carte',
 			null,
 			feature.geometry.coordinates[0],
 			feature.geometry.coordinates[1]
 		)
 	}
 
 	return null
 }
 
 // We don't need full precision, just 5 decimals ~ 1m
 // https://wiki.openstreetmap.org/wiki/Precision_of_coordinates
 // We'll even try with 4 and see
 // TODO : longitude rounding should depend on latitude + cosine stuff
 export const buildAllezPart = (name, id, longitude, latitude) => {
 	const part = `${name}|${id || ''}|${longitude.toFixed(4)}|${latitude.toFixed(
 		4
 	)}`
 	return part
 }
 
 export const removeStatePart = (key: string | number, state: Array<object>) =>
 	state
 		.map(
 			(part, index) =>
 				part != null &&
 				((typeof key === 'string' ? part.key === key : index === key)
 					? false
 					: part.key)
 		)
 		.filter(Boolean)
 		.join('->')
 
 export const setAllezPart = (
 	key: string | number,
 	state: Array<object>,
 	value: string
 ) => {
 	//	const iterator = [...new Array(Math.max(+1, array.length))]
 
 	const allez = state
 		.map((part, index) =>
 			(typeof key === 'string' ? part.key === key : index === key)
 				? value
 				: part
 				? part.key
 				: ''
 		)
 		.join('->')
 
 	return allez
 }
 
 export default function SetDestination({
 	geocodedClickedPoint,
 	geolocation,
 	searchParams,
 	osmFeature,
 }) {
 	const setSearchParams = useSetSearchParams()
 
 	const destinationPart =
 		geocodedClickedPoint && !osmFeature
 			? buildAllezPart(
 					'Point sur la carte',
 					null,
 					geocodedClickedPoint.longitude,
 					geocodedClickedPoint.latitude
 			  )
 			: searchParams.allez || ''
 
 	const newSearchParams = {
 		allez: geolocation
 			? `${buildAllezPart(
 					'Votre position',
 					null,
 					geolocation.longitude,
 					geolocation.latitude
 			  )}->${destinationPart}`
 			: `->${destinationPart}`,
 	}
 
 	const href = setSearchParams(newSearchParams, true, false)
 
 	const destination = destinationPart.split('|').slice(2)
 	if (!destination.length) return null
 	const origin = geolocation && [geolocation.longitude, geolocation.latitude]
 
 	const distance = origin && turfDistance(origin, destination)
 	const humanDistance = distance && computeHumanDistance(distance * 1000)
 
 	return (
 		<PlaceButton>
 			<Link href={href}>
 				<button>
 					<div>
 						<Image
 							src="/itinerary.svg"
 							width="50"
 							height="50"
 							alt="Lancer le mode itinéraire"
 						/>
 					</div>
 					{distance ? (
 						<div>
 							À {humanDistance[0]} {humanDistance[1]}
 						</div>
 					) : (
 						<div>Y aller</div>
 					)}
 				</button>
 			</Link>
 		</PlaceButton>
 	)
 }
