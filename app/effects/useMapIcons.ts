import { useEffect } from 'react'

//chargement du yaml contenant la gestion des redirections
import imageRedirectsRaw from '@/app/imageRedirects.yaml'

export const shouldNotAddIconsToMapStyle = (styleUrl) =>
	!styleUrl || typeof styleUrl !== 'object' || styleUrl.name !== 'France'

export default function useMapIcons(map, styleUrl) {
	useEffect(() => {
		// on annule si la carte n'est pas chargée, ou si autre style que le style france.
		if (!map) return
		if (shouldNotAddIconsToMapStyle(styleUrl)) return

		console.log('cyan will add map icons')

		// surveillances des icones que la carte voudrait afficher mais qui manquent
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
			// on charge le json contenant la liste de toutes les icones à ajouter
			const request = await fetch('/svgo/bulk')
			const bulkIcons = await request.json()
			// on parcourt la liste des redirections à gérer
			// (uniquement celle du cas 1 vers les icones définies dans les catégories
			// car les cas 2 et 3 sont déjà inclus dans /svgo/bulk )
			const imageRedirects = Object.entries(imageRedirectsRaw['in categories'])
				.map(([from, to]) => {
					// si l'icone n'est pas spécifiée, on prévient et on passe à la suivante
					if (!to) {
						console.log(
							'tile (sub)class value ' +
								from +
								' listed but no cartesapp icon correspondance'
						)
						return
					}
					// on cherche dans le json le nom d'icone qui correspond à la redirection
					const found = bulkIcons.find(([iconName, imgSrc]) => iconName === to)

					// si l'icone n'existe pas dans le json /svgo/bulk, on alerte
					if (!found || !Array.isArray(found))
						console.error(
							`Problème avec la redirection d'icône ${found} ${from} ${to}`
						)

					const [iconName, imgSrc] = found // on remplace l'item par vrai/faux
					return [from, imgSrc] // on renvoit l'icone avec le nouveau nom
				})
				.filter(Boolean) // on filtre pour ne garder que les icones trouvées

			// on parcourt les 2 listes( /svgo/bulk + les redirections) pour ajouter chaque image à la carte
			;[...imageRedirects, ...bulkIcons].map(([iconName, imgSrc]) => {
				// on définit le nom d'icone que la carte verra
				const mapImageName = 'cartesapp-' + iconName // avoid collisions
				// on vérifie que la carte n'a pas déjà une image du même nom
				const hasMapImage = map.hasImage(mapImageName)
				if (hasMapImage) {
					console.log('map has already image: ', mapImageName)
				} else {
					console.log('add image to the map: ', mapImageName)
					// on choisit la taille de l'image
					const isSmall = Object.keys(imageRedirectsRaw['small']).find(
						(k) => k === iconName
					)
					const size = isSmall ? 16 : 30

					// on crée l'image
					const img = new Image(size, size)

					const finalSrc = isSmall
						? imgSrc.replace('<svg', "<svg opacity='.4'")
						: imgSrc

					img.src = finalSrc

					// une fois l'image chargée, on l'ajoute à la carte :
					img.onload = () => {
						map.addImage(mapImageName, img) // add prefix to iconName to avoid collisions
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
