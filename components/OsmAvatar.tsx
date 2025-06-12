import { useEffect, useState } from 'react'
import Image from 'next/image'
import { styled } from 'next-yak'

export default function Avatar({ uid }) {
	const [data, setData] = useState(null)
	useEffect(() => {
		const doFetch = async () => {
			const request = await fetch(
				`https://www.openstreetmap.org/api/0.6/user/${uid}?format=json`
			)

			const json = await request.json()
			setData(json)
		}
		doFetch()
	}, [uid, setData])

	console.log('indigo meta user', data)
	const href = data?.user?.img?.href
	if (!href) return null

	return (
		<Wrapper>
			<Image
				src={href}
				width="30"
				height="30"
				alt={`Image de profil de l'utilisateur`}
			/>
		</Wrapper>
	)
}

const Wrapper = styled.span`
	img {
		width: 1.4rem;
		height: auto;
		vertical-align: middle;
		border: 2px solid white;
		border-radius: 2rem;
		margin-right: 0.2rem;
		margin-bottom: 0.1rem;
	}
`
