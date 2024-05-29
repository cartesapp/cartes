export const baseNameKeys = ['name:fr', 'name']

export default function getName(tags) {
	const name = tags['name:fr'] || tags['name']

	return name
}

export const getNameKeys = (tags) => {
	return Object.keys(tags).filter(
		(key) =>
			key === 'name' || key.startsWith('name:') || key.startsWith('alt_name:')
	)
}

export const getNames = (tags) => {
	const entries = Object.entries(tags)
	return entries
		.filter(([k]) => k.startsWith('name:'))
		.map(([key, value]) => [
			key,
			[
				value,
				entries
					.filter(([k2]) => k2 === 'alt_name:' + key.split('name:')[1])
					.map(([, v2]) => v2),
			],
		])
}
