 import dynamic from 'next/dynamic'
 import { Suspense } from 'react'
 
 const Panoramax = dynamic(() => import('./Panoramax'), {
 	ssr: false,
 })
 
 export default function PanoramaxLoader(props) {
 	return (
 		<Suspense>
 			<Panoramax {...props} />
 		</Suspense>
 	)
 }
