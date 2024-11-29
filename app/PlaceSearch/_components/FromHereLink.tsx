 import { buildAllezPart } from '@/app/SetDestination'
 import useSetSearchParams from '@/components/useSetSearchParams'
 import Link from 'next/link'
 
 export function FromHereLink({ geolocation, searchParams }) {
 	const setSearchParams = useSetSearchParams()
 	return (
 		<Link
 			href={setSearchParams(
 				{
 					allez:
 						buildAllezPart(
 							'Ma position',
 							null,
 							geolocation.longitude,
 							geolocation.latitude
 						) + searchParams.allez,
 				},
 				true
 			)}
 		>
 			Depuis ma position
 		</Link>
 	)
 }
