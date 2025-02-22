import { getThumb } from '@/components/wikidata'
import { useEffect, useState } from 'react'
import { createSearchBBox } from './createSearchPolygon'
import { FeatureImage } from './FeatureImage'
import Image from 'next/image'
import {
	getWikimediaGeosearchUrl,
	handleWikimediaGeosearchImages,
} from './effects/useImageSearch'
import useSetSearchParams from '@/components/useSetSearchParams'
import Link from 'next/link'
import panoramaxIcon from '@/public/panoramax.svg'
import { css, styled } from 'next-yak'

export function useZoneImages({
	latLngClicked,
	setLatLngClicked,
	panoramaxOsmTag,
	panoramaxId,
}) {
	const setSearchParams = useSetSearchParams()
	const [wikimedia, setWikimedia] = useState(null)
	const [panoramax, setPanoramax] = useState(null)

	useEffect(() => {
		if (!latLngClicked) return
		const makeRequest = async () => {
			const { lat1, lng1, lat2, lng2 } = createSearchBBox(latLngClicked)
			const bboxString = `${lat2}|${lng2}|${lat1}|${lng1}`

			const url = getWikimediaGeosearchUrl(bboxString)

			setWikimedia([])
			const request = await fetch(url)

			const json = await request.json()

			const images = handleWikimediaGeosearchImages(json)

			if (images.length) setWikimedia(images)
			if (!images.length) {
				setWikimedia(null)
				setLatLngClicked(null)
			}
		}
		makeRequest()
	}, [latLngClicked, setLatLngClicked])

	useEffect(() => {
		console.log('panoramax url', panoramaxOsmTag)
		if (!latLngClicked && !panoramaxOsmTag) return
		const makeRequest = async () => {
			if (panoramaxOsmTag) {
				const pictureUrl = `https://api.panoramax.xyz/api/pictures/${panoramaxOsmTag}/thumb.jpg`
				console.log('panoramax picture', pictureUrl)
				if (panoramaxId) setSearchParams({ panoramax: panoramaxOsmTag })
				setPanoramax([
					{
						thumb: pictureUrl,
						id: panoramaxOsmTag,
						link: `https://api.panoramax.xyz/#focus=pic&pic=${panoramaxOsmTag}`,
					},
				])
				return
			}

			const { lat1, lng1, lat2, lng2 } = createSearchBBox(latLngClicked)
			const url = `https://api.panoramax.xyz/api/search?limit=1&bbox=${lng2},${lat1},${lng1},${lat2}`
			setPanoramax([])
			const request = await fetch(url)

			const json = await request.json()
			const images = json.features
			if (images.length && images[0]?.assets?.thumb) {
				const id = images[0].id
				if (panoramaxId) setSearchParams({ panoramax: id })
				setPanoramax([
					{
						thumb: images[0].assets.thumb.href,
						id,
						link: `https://api.panoramax.xyz/#focus=pic&pic=${images[0].id}`,
					},
				])
			} else {
				setPanoramax(null)
				setLatLngClicked(null)
			}
		}
		makeRequest()
	}, [
		latLngClicked,
		setLatLngClicked,
		panoramaxOsmTag,
		panoramaxId,
		setSearchParams,
	])

	return [
		wikimedia,
		panoramax,
		() => {
			setWikimedia(null)
			setPanoramax(null)
		},
	]
}

export function ZoneImages({
	zoneImages,
	panoramaxImages = null,
	focusImage,
	allPhotos = null,
	displayImages,
}) {
	const setSearchParams = useSetSearchParams()
	const images =
		zoneImages &&
		zoneImages.map((json) => {
			const title = json.title,
				url = json.thumbnailUrl || getThumb(title, 400)
			return {
				...json,
				url,
			}
		})
	//TODO handle multiple images ?
	const panoramaxImage = panoramaxImages && panoramaxImages[0]

	const hasImages = panoramaxImages || images?.length > 0
	if (!hasImages && !displayImages) return null
	return (
		<Wrapper>
			{hasImages && (
				<ul>
					{panoramaxImage && (
						<Link
							href={setSearchParams({ panoramax: panoramaxImage.id }, true)}
						>
							<PanoramaxImageWrapper title="Cette zone est visualisable depuis la rue grâce au projet Panoramax">
								<Image src={panoramaxIcon} alt="Logo du projet Panoramax" />
								<FeatureImage
									src={panoramaxImage.thumb}
									alt="Image de terrain issue de Panoramax"
									width="150"
									height="150"
								/>
							</PanoramaxImageWrapper>
						</Link>
					)}
					{images &&
						images.length > 0 &&
						images.map((image) => {
							const { url } = image
							return (
								<li key={url}>
									<button onClick={() => focusImage(image)}>
										<FeatureImage
											src={url}
											alt="Image de terrain issue de Wikimedia Commons"
											width="150"
											height="150"
										/>
									</button>
								</li>
							)
						})}
				</ul>
			)}

			{displayImages && (
				<div style={{ float: 'right', marginBottom: '1rem' }}>
					{zoneImages?.length > 0 && (
						<small>
							{!allPhotos ? (
								<span>Photos des articles Wikipedia du coin. </span>
							) : (
								<span>Photos collaboratives Wikimedia Commons. </span>
							)}
						</small>
					)}

					<small>
						{!allPhotos ? (
							<Link href={setSearchParams({ photos: 'toutes' }, true)}>
								Afficher les photos de contributeurs
							</Link>
						) : (
							<Link href={setSearchParams({ photos: 'oui' }, true)}>
								N'afficher que les photos Wikipedia
							</Link>
						)}
						.
					</small>
				</div>
			)}
		</Wrapper>
	)
}

const Wrapper = styled.section`
	margin-top: 1rem;
	margin-bottom: 1rem;
	overflow-x: scroll;
	white-space: nowrap;
	&::-webkit-scrollbar {
		display: none;
	}
	> ul {
		margin: 0 0 0.4rem 0;
		display: flex;
		list-style-type: none;

		li {
			padding: 0;
			margin: 0 0.4rem;
			button {
				margin: 0;
				padding: 0;
			}
		}
		img {
		}
	}
	small {
		display: block;
		color: #88aed4;
		text-align: right;
		a {
			color: inherit;
			text-decoration: underline;
			text-underline-offset: 1.2px;
		}
	}
`
const PanoramaxImageWrapper = styled.div`
	position: relative;
	> img:first-child {
		position: absolute;
		bottom: 0.8rem;
		left: 0.4rem;
		width: 2.2rem;
		height: auto;
	}
	> img:last-child {
		border: 2px solid #83328a;
	}
`
