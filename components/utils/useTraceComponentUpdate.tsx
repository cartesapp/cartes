 import { useEffect, useRef } from 'react'
 
 function useTraceComponentUpdate(props, component) {
 	console.log('trace component initialised', component)
 	const prev = useRef(props)
 	useEffect(() => {
 		const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
 			if (prev.current[k] !== v) {
 				ps[k] = [prev.current[k], v]
 			}
 			return ps
 		}, {})
 		if (Object.keys(changedProps).length > 0) {
 			console.log('Changed props:', changedProps)
 		}
 		prev.current = props
 	})
 }
 
 export default useTraceComponentUpdate
