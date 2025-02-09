import categoryColors from '@/app/categoryColors.yaml'
import { categories } from '@/components/categories'
import fs from 'fs'
import { optimize } from 'svgo'
import { fromSvgToImgSrc, svgTextToDataImage } from '../route'
import imageRedirects from '@/app/imageRedirects.yaml'

// ### CREATION DES ICONES EN BULK ###
// Cette route renvoie 1 json contenant toutes les icones qui doivent être ajoutées sur la carte
// Les icones sont calculées en combinant le svg d'entrée avec un fond coloré correspondant à la catégorie

// ETAPE 1/3 : icones listées dans les catégories

// on prépare la listes des groupes de catégories
const groups = categories.reduce((memo, next) => {
	return {
		...memo,
		[next.category]: [...(memo[next.category] || []), next],
	}
}, {})

// on parcourt les groupes

const icons = Object.entries(groups).map(([group, groupCategories]) => {
	const groupColor = categoryColors[group] // on récupère la couleur du groupe
	// on parcourt les catégories

	return groupCategories.map((category) => {
		const imageFilename = category.icon // le nom du fichier svg en entrée
		const imageFinalFilename = category['icon name'] // l'ID à utiliser en sortie (pour gérer les usages multiples d'un même svg d'entrée)
		const imageName =
			'cartesapp-' + // avoid collisions
			(imageFinalFilename || imageFilename)
		try {
			// on récupère l'image svg et on ajoute le background correspondant à sa catégorie
			const data = fs.readFileSync(
				'./public/icons/' + imageFilename + '.svg',
				'utf8'
			)
			const result = optimize(data, {})
			const optimizedSvgString = result.data
			const imgSrc = fromSvgToImgSrc(optimizedSvgString, groupColor)
			return [imageName, imgSrc]
		} catch (e) {
			console.error(e)
		}
	})
})

const fromCategories = icons.flat()

// ETAPE 2/3 : icones hors catégories (listées dans imageRedirects.yaml : not in categories)

const notInCategories = Object.entries(imageRedirects['not in categories'])
	.map(([k, v]) => {
		try {
			// on récupère l'image svg et on ajoute le background correspondant à la catégorie "Divers"
			const data = fs.readFileSync(
				'./public/icons/' + (v || k) + '.svg',
				'utf8'
			)
			const result = optimize(data, {})
			const optimizedSvgString = result.data
			const imgSrc = fromSvgToImgSrc(
				optimizedSvgString,
				categoryColors['Divers']
			)
			return ['cartesapp-' + k, imgSrc]
		} catch (e) {
			console.error(e)
		}
	})
	.filter(Boolean)

// ETAPE 3/3 : icones sans fond coloré (listées dans imageRedirects.yaml : small)

const small = Object.entries(imageRedirects['small'])
	.map(([k, v]) => {
		try {
			// on récupère l'image svg et on la laisse telle quelle
			const data = fs.readFileSync(
				'./public/icons/' + (v || k) + '.svg',
				'utf8'
			)
			const result = optimize(data, {})
			const optimizedSvgString = result.data
			const src = svgTextToDataImage(optimizedSvgString)
			return ['cartesapp-' + k, src]
		} catch (e) {
			console.error(e)
		}
	})
	.filter(Boolean)

// FINALISATION : On combine tout dans 1 json et on renvoie le résultat

const allEntries = [...fromCategories, ...notInCategories, ...small]

const map = Object.fromEntries(allEntries)

const result = Object.entries(map)

export async function GET() {
	return Response.json(result)
}
