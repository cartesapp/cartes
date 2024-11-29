 import dynamic from 'next/dynamic'
 import { Suspense, useState } from 'react'
 import {styled} from 'next-yak'
 
 const DownloadGPX = dynamic(() => import('./DownloadGPX'), {
 	ssr: false,
 })
 export default function DownloadGPXWrapper({ feature }) {
 	const [download, setDownload] = useState(false)
 	if (download)
 		return (
 			<Suspense>
 				<DownloadGPX reset={() => setDownload(false)} feature={feature} />
 			</Suspense>
 		)
 	return (
 		<Wrapper>
 			<button onClick={() => setDownload(true)}>
 				Télécharger l'itinéraire en fichier GPX
 			</button>
 			<small>Pour l'ouvrir dans votre app mobile préférée.</small>
 		</Wrapper>
 	)
 }
 
 export const Wrapper = styled.section`
 	button {
 		margin: 0;
 		background: var(--lightestColor);
 	}
 	margin: 2rem auto 1rem;
 	width: 20rem;
 	text-align: center;
 `
