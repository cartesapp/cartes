export default async function buildSvgImage(
	imageFilename,
	outputFilename = null,
	then,
	backgroundColor,
	iconSize = 40
) {
	const imageRequest = await fetch(
		'/svgo?svgFilename=' +
			imageFilename +
			'&background=' +
			encodeURIComponent(backgroundColor) +
			(outputFilename ? '&outputFilename=' + outputFilename : '')
	)
	const src = await imageRequest.text()

	// If both the image and svg are found, replace the image with the svg.
	const img = new Image(iconSize, iconSize)

	img.src = src

	img.onload = () => then(img, src)

	return src
}
