 'use client'
 import { useEffect, useState } from 'react'
 import { PlaceButton } from './PlaceButtonsUI'
 import { buildAllezPart } from './SetDestination'
 import { encodePlace } from './utils'
 import shareIcon from '@/public/share.svg'
 import Image from 'next/image'
 import { getFetchUrlBase } from './serverUrls'
 import getName from './osm/getName'
 
 export default function ShareButton({ osmFeature, geocodedClickedPoint }) {
 	console.log('purple share', osmFeature, geocodedClickedPoint)
 
 	const urlBase = getFetchUrlBase()
 	const [navigatorShare, setNavigatorShare] = useState(false)
 
 	useEffect(() => {
 		if (navigator.share) setNavigatorShare(true)
 	}, [setNavigatorShare])
 
 	const url = encodeURI(
 		`${urlBase}/?allez=${
 			osmFeature
 				? buildAllezPart(
 						osmFeature.tags?.name,
 						encodePlace(osmFeature.type, osmFeature.id),
 						osmFeature.lon,
 						osmFeature.lat
 				  )
 				: buildAllezPart(
 						'Point sur la carte',
 						null,
 						geocodedClickedPoint.longitude,
 						geocodedClickedPoint.latitude
 				  )
 		}`
 	)
 	const text =
 		geocodedClickedPoint &&
 		(getName(osmFeature?.tags || {}) ||
 			`Lon ${geocodedClickedPoint.longitude} | lat ${geocodedClickedPoint.latitude}`)
 
 	return (
 		<PlaceButton>
 			{navigatorShare ? (
 				<button
 					css={css`
 						margin: 0 auto !important;
 					`}
 					title="Cliquez pour partager le lien"
 					onClick={() => {
 						navigator
 							.share({
 								text,
 								url,
 								title: text,
 							})
 							.then(() => console.log('Successful share'))
 							.catch((error) => console.log('Error sharing', error))
 					}}
 				>
 					<div>
 						<Image src={shareIcon} alt="Icône de partage" />
 					</div>
 					<div>Partager</div>
 					{/* Created by Barracuda from the Noun Project */}
 				</button>
 			) : (
 				<DesktopShareButton {...{ url }} />
 			)}
 		</PlaceButton>
 	)
 }
 
 export const DesktopShareButton = ({ url }) => {
 	const [copySuccess, setCopySuccess] = useState(false)
 
 	function copyToClipboard(e) {
 		navigator.clipboard.writeText(url).then(
 			function () {
 				setCopySuccess(true)
 				console.log('Async: Copying to clipboard was successful !')
 			},
 			function (err) {
 				console.error('Async: Could not copy text: ', err)
 			}
 		)
 		e.preventDefault()
 		return null
 	}
 
 	return (
 		<button onClick={copyToClipboard}>
 			<div>
 				<Image src={shareIcon} alt="Icône de partage" />
 			</div>
 			<div>
 				{!copySuccess ? (
 					'Partager'
 				) : (
 					<span
 						css={css`
 							background: white;
 							color: var(--color);
 							padding: 0 0.4rem;
 							line-height: 1.2rem;
 							border-radius: 0.2rem;
 						`}
 					>
 						Copié !
 					</span>
 				)}
 			</div>
 		</button>
 	)
 }
