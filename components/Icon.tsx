'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getFetchUrlBase } from '@/app/serverUrls'

export const urlBase = `https://cdn.jsdelivr.net/gh/osmandapp/OsmAnd-resources/icons/svg/`

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
