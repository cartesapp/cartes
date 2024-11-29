 'use client'
 
 import { useEffect } from 'react'
 
 export default function CaptureSpacebar({ children }) {
 	useEffect(() => {
 		const handleKeyPress = (e) => {
 			if (e.keyCode == 32) {
 				const minus = e.shiftKey ? -1 : 1
 				window.scrollBy(0, minus * window.innerHeight)
 				e.preventDefault()
 				e.stopPropagation()
 				return false
 			}
 		}
 		window.addEventListener('keydown', handleKeyPress)
 
 		return () => {
 			window.removeEventListener('keydown', handleKeyPress)
 		}
 	}, [])
 	return children
 }
