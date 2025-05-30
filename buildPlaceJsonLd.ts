import { buildAllezPartFromOsmFeature } from './app/SetDestination'
import getUrl from './app/osm/getUrl'
import { getFetchUrlBase } from './app/serverUrls'
import { buildPlaceMap } from './components/buildPlaceMap'
import fetchOgImage from './components/fetchOgImage'

export default async function buildPlaceJsonLd(step) {
	const {
		tags = {},
		center: {
			geometry: {
				coordinates: [lon, lat],
			},
		},
		photonFeature,
	} = step
	const osmImage = tags.image || (await fetchOgImage(getUrl(tags)))

	const addressProperties = photonFeature && photonFeature.properties

	const url =
		getFetchUrlBase() +
		'/?allez=' +
		encodeURIComponent(buildAllezPartFromOsmFeature(step))

	const image = osmImage || buildPlaceMap(lat, lon)

	const result = {
		'@context': 'https://schema.org',
		'@type': 'Place', //TODO make this more precise with categories.yaml
		//TODO read this list of properties to see which we can fill
		//https://schema.org/Place
		//additionalType: ['http://www.productontology.org/id/G%C3%AEte'], //TODO
		//this too if useful
		//TODO put all tags not used as additionalProperty https://schema.org/additionalProperty
		//
		//
		image: image ? [image] : undefined,
		//TODO duplicate of image ?
		...(image
			? {
					photo: {
						'@type': 'ImageObject',
						contentUrl: image,
						name: tags.name,
					},
			  }
			: {}),
		name: tags.name,
		description: tags.description,
		url,

		...(addressProperties
			? {
					address: {
						'@type': 'PostalAddress',
						addressLocality: addressProperties.city,
						postalCode: addressProperties.postcode,
						addressRegion: addressProperties.state,
						addressCountry: addressProperties.countrycode,
					},
			  }
			: {}),
		geo: {
			'@type': 'GeoCoordinates',
			latitude: lat,
			longitude: lon,
		},
		hasMap: 'https://cartes.app/',
		telephone: tags['phone'] || tags['contact:phone'] || tags['contact:mobile'],
		alternateName: tags['alt_name'],
		//TODO
		//isAccessibleForFree
		//for opening hours we'll need the work of someone else
		//openingHoursSpecification
	}

	return Object.fromEntries(
		Object.entries(result)
			.map(([k, v]) => v != null && [k, v])
			.filter(Boolean)
	)
}
