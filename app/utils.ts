const correspondance = { r: 'relation', w: 'way', n: 'node' }

export const decodePlace = (place) => {
	if (!place) return [null, null]
	const letter = place.slice(0, 1)

	const id = place.slice(1)

	return [correspondance[letter], id]
}

export const encodePlace = (featureType, id) =>
	featureType.slice(0, 1).toLowerCase() + id

export const computeSncfUicControlDigit = (uic) => {
	const multiplied = ('' + uic)
		.replace(/^(00)?87/, '')
		.split('')
		.map((digit, index) => +digit * (index & 1 ? 1 : 2))
	const sum = multiplied
		.join('')
		.split('')
		.reduce((memo, next) => memo + +next, 0)

	console.log('sum uic8', multiplied, sum)

	const nextFactorOfTen = Math.round((sum + 5) / 10) * 10
	return nextFactorOfTen - sum
}

export const atOrUrl = (_key: string, domain: string) => {
	const key = _key.replace(/[^\x20-\x7E]/g, '') // Remove non-ascii characters
	return key
		.replace('http://', 'https://')
		.replace('://www.', '://')
		.startsWith(domain)
		? key
		: key.startsWith(domain.split('://')[1])
		? `https://${key}`
		: `${domain}/${key}`
}

export const computeCenterFromBbox = (bbox) => [
	(bbox[0][0] + bbox[1][0]) / 2,
	(bbox[0][1] + bbox[1][1]) / 2,
]
