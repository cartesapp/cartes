import { geocodeGetAddress } from '@/components/geocodeLatLon'
import { centerOfMass } from '@turf/turf'
import { enrichOsmFeatureWithPolygon, osmRequest } from './osmRequest'
import { isServer } from './serverUrls'
import { decodePlace } from './utils'

export const stepOsmRequest = async (point, state = [], geocode = false) => {
	if (!point || point === '') return null
	// those constitute the encoding of a place in the "allez" url query param
	const [name, osmCode, longitude, latitude] = point.split('|')

	console.log('lightgreen will enrichState', { isServer }, state)
	const found = state
		.filter(Boolean)
		.find(
			(point) =>
				osmCode !== '' &&
				point.osmCode === osmCode &&
				!point.osmFeature?.failedServerOsmRequest
		)
	if (found) return found // already cached, don't make useless requests

	const [featureType, featureId] = decodePlace(osmCode)

	const request = async () => {
		console.log('Preparing OSM request ', featureType, featureId)
		// Overpass requests for ways and relations necessitate "full" request mode
		// to be able to rebuild its shape based on its node and ways elements
		const full = ['way', 'relation'].includes(featureType)
		const isNode = featureType === 'node'
		if (!isNode && !full)
			return console.error(
				"This OSM feature is neither a node, a relation or a way, we don't know how to handle it"
			)

		const elements = await osmRequest(featureType, featureId, full)

		if (!elements.length) return
		/*
		console.log(
			'OSM elements received',
			elements,
			' for ',
			featureType,
			featureId
		)
		*/

		const element = elements.find((el) => el.id == featureId)

		if (element.failedServerOsmRequest)
			return {
				...element,
				osmCode,
				longitude: longitude,
				latitude: latitude,
				name,
			}

		const adminCenter =
				element && element.members?.find((el) => el.role === 'admin_centre'),
			adminCenterNode =
				adminCenter && elements.find((el) => el.id == adminCenter.ref)

		//console.log('admincenter', relation, adminCenter, adminCenterNode)
		const nodeCenter = element.center
			? element.center.geometry.coordinates
			: adminCenterNode
			? [adminCenterNode.lon, adminCenterNode.lat]
			: !full
			? [element.lon, element.lat]
			: centerOfMass(
					featureCollectionFromOsmNodes(
						elements.filter((el) => el.lat && el.lon)
					)
			  ).geometry.coordinates

		/*
		console.log(
			'will set OSMfeature after loading it from the URL',
			element,
			nodeCenter
		)
		*/
		const polygon =
			element.feature?.geometry.type === 'Polygon'
				? element.feature
				: ['way', 'relation'].includes(element.type) &&
				  enrichOsmFeatureWithPolygon(element, elements).polygon

		const result = {
			...element,
			lat: nodeCenter[1],
			lon: nodeCenter[0],
			polygon,
		}
		console.log('lightgreen polygon', result)
		return result
	}
	const osmFeature = await request()

	const result = {
		osmCode,
		longitude: longitude || osmFeature.lon,
		latitude: latitude || osmFeature.lat,
		name,
		osmFeature,
		key: point,
	}

	if (!geocode) return result
	if (!osmFeature) return result

	const [photonAddress, photonFeature] = await geocodeGetAddress(
		result.latitude,
		result.longitude,
		osmFeature.id
	)
	return { ...result, photonAddress, photonFeature }
}

function featureCollectionFromOsmNodes(nodes) {
	//console.log('yanodes', nodes)
	const fc = {
		type: 'FeatureCollection',
		features: nodes.map((el) => ({
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'Point',
				coordinates: [el.lon, el.lat],
			},
		})),
	}

	return fc
}
