import { omit } from '@/components/utils/utils'
import { goodIconSize, mapLibreBboxToOverpass } from '@/components/mapUtils'
import maplibregl from 'maplibre-gl'
import { useEffect, useMemo, useState } from 'react'

/*
 * TODO
 * This component is not optimized, and may feel clumsy
 *
 * - we limit the nb of images since there could be 10 000 images in a single bbox
 * - wikimedia can return images on a localised small part of the bbox because of that limit
 * - solution ? Use the coord instead of bbox, and expect the user to drag to view more images
 * - when you do a search somewhere, then drag the map, the new search should be done only in the added surface
 * - it would be cool to use the "featured" or "quality" image tags from commons, but it does not look possible in one request https://stackoverflow.com/questions/24529853/how-to-get-more-info-within-only-one-geosearch-call-via-wikipedia-api
 * - this request for featured, but cannot generator geosearch https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Featured_pictures_on_Wikimedia_Commons&cmlimit=100&cmtype=file&format=json
 * - etc
 *
 *
 */
const serializeBbox = (bbox) => {
	if (!bbox) return null

	const [[lng2, lat1], [lng1, lat2]] = bbox,
		bboxString = `${lat2}|${lng2}|${lat1}|${lng1}`
	return bboxString
}

export const handleWikimediaGeosearchImages = (json) =>
	json?.query
		? Object.values(json.query.pages).map((page) => {
				const {
					GPSLatitude: { value: lat },
					GPSLongitude: { value: lon },
					Assessments: { value: assessment } = {},
					DateTime: { value: date } = {},
					Artist: { value: artistHtmlTag },
					ImageDescription: { value: description } = {},
				} = page.imageinfo[0].extmetadata

				return {
					...omit(['imageinfo'], page),
					lat,
					lon,
					assessment,
					date,
					artistHtmlTag,
					description,
				}
		  })
		: []
export const handleWikimediaPageimageGeosearchImages = (json) =>
	json?.query
		? Object.values(json.query.pages)
				.map((page) => {
					if (!page.thumbnail) return
					const {
						coordinates: [{ lon, lat }],
						title,
						thumbnail: { source: thumbnailUrl },
						original: { source: originalUrl },
						pageimage,
					} = page

					if (pageimage.toLowerCase().includes('.svg')) return

					return {
						pageid: page.pageid,
						lat,
						lon,
						description: title,
						title,
						thumbnailUrl,
						originalUrl,
						pageUrl: `https://commons.wikimedia.org/wiki/File:${pageimage}`,
					}
				})
				.filter(Boolean)
		: []

// Thanks https://stackoverflow.com/questions/24529853/how-to-get-more-info-within-only-one-geosearch-call-via-wikipedia-api
// We'd also like to sort query results by good `assessment` or by other
// factors, but were unable to find documentation on this complex API
export const getWikimediaGeosearchUrl = (bboxString: string) =>
	`https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&generator=geosearch&ggsbbox=${bboxString}&ggsnamespace=6&ggslimit=30&format=json&origin=*`
//commons.wikimedia.org/w/api.php?action=query&cmlimit=500&format=json&origin=*&generator=geosearch&ggsbbox=48.12234761048555|-1.6960791053322168|48.10077270045613|-1.6628225211423455&prop=imageinfo&iiprop=extmetadata

// Another strategy would be to query only Wikipedia page header images,
// considering that they would be high quality images
// TODO but we need lat lon info
// Also, some images would be maps of cities for instance. Useless. Filter
// .svg.png ?
// Source : https://stackoverflow.com/a/32916451
const getWikimediaPageimageGeosearchUrl = (bboxString: string) =>
	//	`https://fr.wikipedia.org/w/api.php?action=query&prop=images|pageimages&pilimit=max&piprop=thumbnail&iwurl=&imlimit=max&generator=geosearch&ggsbbox=${bboxString}&format=json&origin=*`
	`https://fr.wikipedia.org/w/api.php?action=query&prop=coordinates|pageimages&piprop=original|thumbnail|name&iwurl=&pithumbsize=250&pilimit=6&generator=geosearch&ggsbbox=${bboxString}&format=json&origin=*`

export default function useImageSearch(
	map,
	setBboxImages,
	zoom,
	bbox,
	photos,
	focusImage,
	wikidataPictureObject
) {
	const active = photos != null
	const [imageCache, setImageCache] = useState([])

	const bboxString = serializeBbox(bbox)

	// We could memoize the selection of images that is in the bbox view,
	// but MapLibre probably doesn't draw images outside of the window ! At least
	// we hope so
	// ... but we need to filter them for the content view !
	const bboxImages = useMemo(
		() =>
			imageCache.filter(
				({ lat, lon }) =>
					lon > bbox[0][0] &&
					lon < bbox[1][0] &&
					lat < bbox[1][1] &&
					lat > bbox[0][1]
			),
		[imageCache, bboxString]
	)
	useEffect(() => {
		if (bboxImages.length > 0) setBboxImages(bboxImages)
	}, [bboxImages])

	useEffect(() => {
		if (!active) return
		if (!bboxString) return
		const makeRequest = async () => {
			const url =
				photos === 'toutes'
					? getWikimediaGeosearchUrl(bboxString)
					: getWikimediaPageimageGeosearchUrl(bboxString)

			const request = await fetch(url)

			const json = await request.json()

			if (photos === 'toutes') {
				const newImages = handleWikimediaGeosearchImages(json)
				console.log('green new', newImages)
				const trulyNewImages = newImages.filter(
					(newImage) =>
						!imageCache.find((image) => image.pageid === newImage.pageid)
				)

				if (trulyNewImages.length)
					setImageCache((old) => [...old, ...trulyNewImages])
			} else {
				const newImages = handleWikimediaPageimageGeosearchImages(json)
				console.log('green new', newImages)
				const imageMap = new Map(
					newImages.map((image) => [image.pageUrl, image])
				)
				// in "summary" mode, this
				return setImageCache([...imageMap.values()])
			}
		}
		makeRequest()
	}, [
		setImageCache,
		bboxString,
		imageCache.map((image) => image.pageUrl).join('-||-'),
		active,
		photos,
	])

	console.log('redou2', wikidataPictureObject)
	useEffect(() => {
		if (!map) return
		if (!active && !wikidataPictureObject) return
		if (zoom < 11) return

		if (!bboxImages.length && !wikidataPictureObject) return

		const markers = [wikidataPictureObject, ...(bboxImages || [])]
			.filter(Boolean)
			.map((image) => {
				const size = goodIconSize(zoom, 1.3) + 'px'

				const img = document.createElement('img')
				img.src =
					image.thumbnailUrl ||
					`https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(
						image.title
					)}&width=150`
				img.style.cssText = `
			width: ${size};height: ${size};
			border-radius: ${size};
			object-fit: cover;
			`
				img.onload = function () {
					img.setAttribute('alt', image.title)
					img.style.cssText += `
			border: 3px solid white;
				`
				} // This because title overflows and is unreadable on the small disc on the map

				!image.fromWikidata &&
					img.addEventListener('click', () => {
						focusImage(image)
					})

				const marker = new maplibregl.Marker({ element: img })
					.setLngLat({ lng: image.lon, lat: image.lat })
					.addTo(map)

				return marker
			})
		return () => {
			markers.map((marker) => marker.remove())
		}
	}, [map, zoom, bboxImages, active, wikidataPictureObject])
}
