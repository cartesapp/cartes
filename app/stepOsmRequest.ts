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
	console.log('indigo will ', { isServer }, state)

	const [featureType, featureId] = decodePlace(osmCode)

	const request = async () => {
		console.log('Preparing OSM request ', featureType, featureId)
		const full = ['way', 'relation'].includes(featureType)
		const isNode = featureType === 'node'
		if (!isNode && !full)
			return console.log(
				"This OSM feature is neither a node, a relation or a way, we don't know how to handle it"
			)

		const element = await osmApiRequest(featureType, featureId)

		return console.log('brown', element)
		if (!element) return

		if (element.failedServerOsmRequest)
			return {
				...element,
				osmCode,
				longitude: longitude,
				latitude: latitude,
				name,
			}

		const featureCollectionFromOsmNodes = (nodes) => {
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

		/* TODO do this elsewhere, we don't want a dependency to map here
			console.log('should fly to', nodeCenter)
			if (!choice || choice.osmId !== featureId) {
				console.log(
					'blue',
					'will fly to in after OSM download from url query param',
					nodeCenter
				)
				map.flyTo({
					center: nodeCenter,
					zoom: 18,
					pitch: 50, // pitch in degrees
					bearing: 20, // bearing in degrees
				})
			}
			*/
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
