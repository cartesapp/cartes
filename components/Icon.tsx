'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getFetchUrlBase } from '@/app/serverUrls'
export const urlBase = `${getFetchUrlBase()}/osmand-icons/icons/svg/`

export const defaultIconSrc = `/dot.svg`

export default function Icon({ k, v }) {
	const [iconSrc, setIconSrc] = useState(defaultIconSrc)

	useEffect(() => {
		const doFetch = async () => {
			const request = await fetch(
				getFetchUrlBase() + `/api/osmTagsToIcon?k=${k}&v=${v}`,
				{
					cache: 'force-cache',
				}
			)

			// Check if the response status is 404
			if (request.status === 404 || !request.ok) {
				return
			}

			const foundIcon = await request.json()
			const iconSrc = foundIcon ? urlBase + foundIcon[1] : defaultIconSrc
			setIconSrc(iconSrc)
		}
		doFetch()
	}, [setIconSrc, k, v])

	return (
		<Image
			width="10"
			height="10"
			src={iconSrc}
			alt="Icône représentant au mieux le type de lieu"
		/>
	)
}
