 import useSetSearchParams from '@/components/useSetSearchParams'
 import { Viewer } from '@panoramax/web-viewer'
 import '@panoramax/web-viewer/build/index.css'
 import panoramaxIcon from '@/public/panoramax.svg'
 import Image from 'next/image'
 import { useEffect, useRef, useState } from 'react'
 import { ModalCloseButton } from './UI'
 import { debounce } from '@/components/utils/utils'
 
 const servers = {
 	meta: 'https://api.panoramax.xyz/api',
 	ign: 'https://panoramax.ign.fr/api',
 	osm: 'https://panoramax.openstreetmap.fr/api',
 }
 
 export default function Panoramax({ id, onMove }) {
 	const ref = useRef()
 	const [viewer, setViewer] = useState(null)
 
 	const setSearchParams = useSetSearchParams()
 
 	const onRotate = (e) => {
 		console.log('panoramax event rotated', e)
 		onMove((position) => ({
 			...position,
 			angle: e.detail.x,
 		}))
 	}
 	const debouncedOnRotate = debounce(100, onRotate)
 
 	useEffect(() => {
 		if (!ref || !ref.current || viewer || !id) return
 		console.log('purple will create panoramax instance', { viewer, id })
 		const panoramax = new Viewer(
 			ref.current, // Div ID
 			servers.meta,
 			{
 				selectedPicture: id,
 				map: false,
 			} // Viewer options
 		)
 		setViewer(panoramax)
 		console.log('panoramax event', panoramax)
 		panoramax['sequence-stopped'] = (e) => console.log('panoramax event', e)
 		panoramax.addEventListener('psv:view-rotated', debouncedOnRotate)
 		panoramax.addEventListener('psv:picture-loading', (e) => {
 			console.log('panoramax event loading', e)
 			const { lat, lon } = e.detail
 			onMove((position) => ({
 				...position,
 				longitude: lon,
 				latitude: lat,
 				angle: e.detail.x,
 			}))
 		})
 
 		return () => {
 			if (viewer) viewer.destroy()
 		}
 	}, [ref, viewer, setViewer, id, debouncedOnRotate])
 
 	console.log('panoramax id', id)
 	useEffect(() => {
 		console.log('should set new panoramax picture id', id)
 		if (!viewer || !id) return
 
 		viewer.select(null, id)
 	}, [id, viewer])
 
 	if (!id) return null
 	return (
 		<div
 			css={css`
 				height: 50vh;
 				width: 96vw;
 				top: 2vw;
 				left: 2vw;
 				position: fixed;
 				z-index: 100;
 
 				@media (min-width: 1000px) {
 					width: 50vw;
 					height: 90vh;
 					top: 4vh;
 					right: 4vw;
 					left: auto;
 				}
 				> div {
 					position: relative;
 					height: 100%;
 				}
 				> div.fullpage {
 					position: fixed;
 					top: 0;
 					bottom: 0;
 					left: 0;
 					right: 0;
 					height: unset;
 					width: unset;
 					margin: 0;
 				}
 				.gvs-loader {
 					border-radius: 0.6rem;
 				}
 				.gvs-main {
 					border-radius: 0.6rem;
 					overflow: hidden;
 					--shadow-color: 54deg 16% 57%;
 					--shadow-elevation-medium: 0.3px 0.5px 0.7px
 							hsl(var(--shadow-color) / 0.36),
 						0.8px 1.6px 2px -0.8px hsl(var(--shadow-color) / 0.36),
 						2.1px 4.1px 5.2px -1.7px hsl(var(--shadow-color) / 0.36),
 						5px 10px 12.6px -2.5px hsl(var(--shadow-color) / 0.36);
 					box-shadow: var(--shadow-elevation-medium);
 				}
 				/* https://gitlab.com/panoramax/clients/web-viewer/-/issues/152 */
 				.gvs-main {
 					height: 100%;
 					.gvs-psv {
 						height: 100%;
 					}
 
 					#gvs-corner-main-top {
 						position: absolute;
 						top: 0;
 					}
 					#gvs-corner-main-bottom {
 						position: absolute;
 						bottom: 0;
 					}
 				}
 				> button {
 					right: 0.3rem !important;
 					img {
 						opacity: 1;
 					}
 				}
 			`}
 		>
 			<div ref={ref} />
 			<a
 				href="https://panoramax.fr"
 				target="_blank"
 				title="Images de rue grâce au projet public Panoramax"
 				css={css`
 					z-index: 1000;
 					position: absolute;
 					bottom: 0.6rem;
 
 					right: 4.3rem;
 					img {
 						vertical-align: bottom;
 						width: 3rem;
 						height: auto;
 					}
 					@media (max-width: 600px) {
 						right: 0.6rem;
 					}
 				`}
 			>
 				<Image src={panoramaxIcon} alt="Logo du projet Panoramax" />
 			</a>
 			<ModalCloseButton
 				onClick={() => {
 					setSearchParams({ panoramax: undefined })
 
 					setTimeout(() => {
 						onMove(null)
 						setViewer(null)
 					}, 300)
 				}}
 			/>
 		</div>
 	)
 }
