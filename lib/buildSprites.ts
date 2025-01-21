import { getFetchUrlBase } from '@/app/serverUrls'
import spritezero from '@jutaz/spritezero'
import fs from 'fs'
import path from 'path'

const pixelRatios = [2, 4]
const sdf = true

export default async function buildSprites() {
	const catRequest = await fetch(getFetchUrlBase() + '/api/icons')
	const categories = await catRequest.json()

	pixelRatios.forEach(async function (pxRatio) {
		var svgs = await Promise.all(
			['restaurant', 'cafe']
				//		.sync(path.resolve(path.join(__dirname, 'input/*.svg')))
				.map(async function (id) {
					const url = `${getFetchUrlBase()}/svgo/?svgFilename=${id}&background=${
						categories.find((c) => c.name === id).color
					}&format=svg`
					console.log(url)
					const request = await fetch(url)

					const svg = await request.text()
					/*
fs.readFileSync(
						path.resolve(path.join(__dirname, '../public/icons/' + id + '.svg'))
					)*/

					return {
						svg,
						id,
					}
				})
		)

		const spritePath = '../public/sprite/cartes' + (pxRatio == 4 ? '@2' : '')
		var pngPath = path.resolve(path.join(__dirname, spritePath + '.png'))
		var jsonPath = path.resolve(path.join(__dirname, spritePath + '.json'))

		// Pass `true` in the layout parameter to generate a data layout
		// suitable for exporting to a JSON sprite manifest file.
		spritezero.generateLayout(
			{ imgs: svgs, pixelRatio: pxRatio, sdf, format: true },
			function (err, dataLayout) {
				if (err) return
				fs.writeFileSync(jsonPath, JSON.stringify(dataLayout))
			}
		)

		// Pass `false` in the layout parameter to generate an image layout
		// suitable for exporting to a PNG sprite image file.
		spritezero.generateLayout(
			{ imgs: svgs, pixelRatio: pxRatio, sdf, format: false },
			function (err, imageLayout) {
				spritezero.generateImage(imageLayout, function (err, image) {
					if (err) return
					fs.writeFileSync(pngPath, image)
				})
			}
		)
	})
}

buildSprites()
