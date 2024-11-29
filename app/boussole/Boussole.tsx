 'use client'
 
 import { Compass } from './UI'
 import useCompass from './useCompass'
 
 export default function Boussole() {
 	const [compass, pointDegree] = useCompass()
 	// What is this ? See calcDegreeToPoint()
 	const myPointOpacity =
 		// ±15 degree
 		(pointDegree < Math.abs(compass) && pointDegree + 15 > Math.abs(compass)) ||
 		pointDegree > Math.abs(compass + 15) ||
 		pointDegree < Math.abs(compass)
 			? 0
 			: pointDegree
 			? 1
 			: false
 
 	return (
 		<div>
 			<Compass>
 				<div className="arrow"></div>
 				<div
 					className="compass-circle"
 					css={
 						compass != null
 							? `
 transform: translate(-50%, -50%) rotate(${-compass}deg) !important`
 							: ''
 					}
 				></div>
 				<div
 					className="my-point"
 					css={myPointOpacity ? `opacity: ${myPointOpacity} !important` : ''}
 				></div>
 			</Compass>
 		</div>
 	)
 }
