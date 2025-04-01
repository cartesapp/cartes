export const lonLatToPoint = (lon, lat) => ({
	type: 'Feature',
	properties: {},
	geometry: {
		type: 'Point',
		coordinates: [lon, lat],
	},
})

export function featureCollectionFromOsmNodes(nodes) {
	//console.log('yanodes', nodes)
	const fc = {
		type: 'FeatureCollection',
		features: nodes.map((el) => lonLatToPoint(el.lon, el.lat)),
	}

	return fc
}
