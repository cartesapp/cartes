import { useEffect } from 'react'

import imageRedirectsRaw from '@/app/imageRedirects.yaml'

export default function useMapIcons(map, styleUrl) {
	useEffect(() => {
		if (!map) return
		if (!styleUrl || typeof styleUrl !== 'object' || styleUrl.name !== 'France')
			return
		console.log('cyan will add map icons')
		const onImageMissing = (e) => {
			const id = e.id // id of the missing image
			console.log('imagemissing', id)
			try {
				if (!window.missingImages) window.missingImages = []
				window.missingImages.push(e.id)
			} catch (e) {
				console.log('Error setting window.missingImages')
			}
		}
		map.on('styleimagemissing', onImageMissing)

		window.map = map
		const doFetch = async () => {
			const request = await fetch('/svgo/bulk')
			const nameSrcMap = await request.json()
			console.log('nameSrcMap', nameSrcMap)
			const imageRedirects = Object.entries(imageRedirectsRaw)
				.filter(([k]) => !['not in categories', 'small'].includes(k))
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
						console.error(
							`Problème avec la redirection d'icône ${found} ${from} ${to}`
						)

					const [name, src] = found
					return ['cartesapp-' + from, src]
				})
				.filter(Boolean)

			console.log('missingRedirects', imageRedirects)

			const count = nameSrcMap.length
			let iterator = 0

			;[...imageRedirects, ...nameSrcMap].map(([imageFinalName, src]) => {
				//build svg image and add to map
				const isSmall = Object.keys(imageRedirectsRaw['small']).find(
					(k) => k === imageFinalName.replace('cartesapp-', '')
				)
				const size = isSmall ? 16 : 30
				const img = new Image(size, size) // bonne taille pour être cohérent avec les sprites d'origine

				img.src = src

				img.onload = () => {
					const hasMapImage = map.hasImage(imageFinalName)
					console.log('addimage ', imageFinalName)
					if (!hasMapImage) {
						console.log('addimage ', imageFinalName)
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
