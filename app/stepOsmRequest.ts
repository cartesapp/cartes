import { centerOfMass } from '@turf/turf'
import { enrichOsmFeatureWithPolyon, osmRequest } from './osmRequest'
import { decodePlace } from './utils'
import { isServer } from './serverUrls'
import { geocodeGetAddress } from '@/components/geocodeLatLon'
import osmApiRequest from '@/components/osm/osmApiRequest'

export const stepOsmRequest = async (point, state = [], geocode = false) => {
	if (!point || point === '') return null
	const [name, osmCode, longitude, latitude] = point.split('|')

	console.log('indigo will 0', { isServer }, state)
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
		const full = ['way', 'relation'].includes(featureType)
		const isNode = featureType === 'node'
		if (!isNode && !full)
			return console.log(
				"This OSM feature is neither a node, a relation or a way, we don't know how to handle it"
			)

		const directElement = await osmApiRequest(featureType, featureId)

		console.log('brown', directElement)
		if (directElement.failedServerOsmRequest)
			return {
				...directElement,
				osmCode,
				longitude: longitude,
				latitude: latitude,
				name,
			}
		if (directElement) {
			const {
				properties: { tags },
				geometry: { type, coordinates },
			} = directElement
			if (type === 'Point')
				return {
					...directElement,
					lon: coordinates[0],
					lat: coordinates[1],
					tags,
					name: tags && tags.name,
				}
		}

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

		const relation = elements.find((el) => el.id == featureId),
			adminCenter =
				relation && relation.members?.find((el) => el.role === 'admin_centre'),
			adminCenterNode =
				adminCenter && elements.find((el) => el.id == adminCenter.ref)

		//console.log('admincenter', relation, adminCenter, adminCenterNode)
		const nodeCenter = adminCenterNode
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
			['way', 'relation'].includes(element.type) &&
			enrichOsmFeatureWithPolyon(element, elements).polygon
		return { ...element, lat: nodeCenter[1], lon: nodeCenter[0], polygon }
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
