import { useEffect } from 'react'

import imageRedirectsRaw from '@/app/imageRedirects.yaml'

export default function useMapIcons(map, styleUrl) {
	useEffect(() => {
		if (!map) return
		const onImageMissing = (e) => {
			const id = e.id // id of the missing image
			console.log('imagemissing', id)
		}
		map.on('styleimagemissing', onImageMissing)

		window.map = map
		const doFetch = async () => {
			const request = await fetch('/svgo/bulk')
			const nameSrcMap = await request.json()
			const imageRedirects = Object.entries(imageRedirectsRaw)
				.filter(([k]) => k !== 'not in categories')
				.map(([from, to]) => {
					if (!to) {
						console.log(
							'imagemissing listed but no cartesapp icon correspondance'
						)
						return
					}
					const found = nameSrcMap.find(
						([name, src]) => name.split('cartesapp-')[1] === to
					)

					if (!found || !Array.isArray(found))
						console.error('Problème avec ' + found)

					const [name, src] = found
					return ['cartesapp--' + from, src]
				})
				.filter(Boolean)

			console.log('missingRedirects', imageRedirects)

			const count = nameSrcMap.length
			let iterator = 0

			;[...imageRedirects, ...nameSrcMap].map(([imageFinalName, src]) => {
				//build svg image and add to map
				const img = new Image(18, 18) // bonne taille pour être cohérent avec les sprites d'origine

				img.src = src

				img.onload = () => {
					const hasMapImage = map.hasImage(imageFinalName)
					if (!hasMapImage) {
						//						console.log('imagemissing not missing', imageFinalName)
						map.addImage(imageFinalName, img)
						iterator += 1
						console.log('iterator', iterator, count)
						if (iterator === count) {
							console.log('PLOP')
							//map.triggerRepaint() //not working
							return
							// not working either
							map.setLayoutProperty('Other POI', 'icon-image', [
								'coalesce',
								['image', ['concat', 'cartesapp-', ['get', 'subclass']]],
								['image', ['concat', 'cartesapp-', ['get', 'class']]],
								// sinon on essaye les sprites standards du style d'origine
								['image', ['get', 'subclass']],
								['image', ['get', 'class']],
								['image', 'dot'],
							])

							//map.setStyle(styleUrl) //triggers an error
						}
						//map.updateImage(imageFinalName, img) // this does not suffice. It's the style that must be reloaded...
					} else {
						iterator += 1
					}
				}
			})
		}
		doFetch()
		return () => {
			map.off(onImageMissing)
		}
	}, [map, styleUrl])
}
