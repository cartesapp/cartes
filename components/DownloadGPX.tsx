 import GeoJsonToGpx from '@dwayneparton/geojson-to-gpx'
 import { useEffect } from 'react'
 import { Wrapper } from './DownloadGPXWrapper'
 
 const options = {
 	metadata: {
 		name: 'Itinéraire créé sur cartes.app',
 	},
 }
 
 const geojson = {
 	type: 'Feature',
 	properties: {
 		name: 'Slow journey from null island',
 	},
 	geometry: {
 		type: 'LineString',
 		coordinates: [
 			[0.0, 0.0],
 			[0.0, 1.0],
 			[0.0, 2.0],
 			[0.0, 3.0],
 		],
 	},
 }
 
 export default function DownloadGPX({ reset, feature }) {
 	// Will convert geojson into xml document
 	const gpx = GeoJsonToGpx(feature, options)
 
 	// convert document to string or post process it
 	const gpxString = new XMLSerializer().serializeToString(gpx)
 	useEffect(() => {
 		// trying another method
 		const filename = 'itineraire-cartes.gpx'
 		download(filename, gpxString, 'application/gpx+xml')
 		return
 		// this first method doesn't seem to work well on android with organicmaps ?
 		// It generates a .xml file, maybe that's why
 		// @see https://stackoverflow.com/questions/10654971/create-text-file-from-string-using-js-and-html5
 		const link = document.createElement('a')
 		link.download = filename
 		const blob = new Blob([gpxString], { type: 'application/gpx+xml' })
 		link.href = window.URL.createObjectURL(blob)
 		link.click()
 	}, [])
 
 	return (
 		<Wrapper>
 			<div>
 				Hop ! Bonne route !
 				<small>Le téléchargement devrait déjà être terminé.</small>
 			</div>
 			<button onClick={() => reset()}>OK</button>
 		</Wrapper>
 	)
 }
 
 function download(filename, text, mimetype) {
 	var element = document.createElement('a')
 	element.setAttribute(
 		'href',
 		`data:${mimetype};charset=utf-8,` + encodeURIComponent(text)
 	)
 	element.setAttribute('download', filename)
 
 	element.style.display = 'none'
 	document.body.appendChild(element)
 
 	element.click()
 
 	document.body.removeChild(element)
 }
