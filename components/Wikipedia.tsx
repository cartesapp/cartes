import { useEffect, useState } from 'react'
import Image from 'next/image'
import wikipediaLogo from '@/public/wikipedia.svg'
import { css, styled } from 'next-yak'

export default function Wikipedia({ name }) {
	const [text, setText] = useState(null)
	const [lang, title] = name.split(':')
	// Note : adding prop=extract|pageimage lets us retrieve the page image, could
	// be useful if we want to avoid the wiki image query in parallel
	const ApiUrl = `https://${lang}.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&explaintext=false&exintro&titles=${encodeURIComponent(
			title
		)}&redirects=1`,
		url = `https://${lang}.wikipedia.org/wiki/${title}`

	useEffect(() => {
		const doFetch = async () => {
			const request = await fetch(ApiUrl),
				json = await request.json()
			const pages = json?.query?.pages
			if (!pages) return
			const { extract } = Object.values(pages)[0]
			setText(extract)
		}
		doFetch()
	}, [ApiUrl])

	const shortenText = text && text.split(' ').slice(0, 50).join(' ')

	return (
		<Wrapper $shortenText={shortenText}>
			<p>
				<Image
					src={wikipediaLogo}
					alt="Logo de Wikipedia"
					width="25"
					height="25"
				/>
				{shortenText}

				<a href={url} target="_blank">
					<small>Wikipedia</small>
				</a>
			</p>
		</Wrapper>
	)
}

const Wrapper = styled.section`
	margin-top: 0.4rem;
	position: relative;
	${(p) =>
		p.$shortenText?.length > 100 &&
		css`
			&:after {
				position: absolute;
				bottom: 0;
				height: 100%;
				width: 100%;
				content: '';
				background: linear-gradient(
					to bottom,
					color-mix(in srgb, var(--lightestColor2) 0%, transparent) 20%,
					color-mix(in srgb, var(--lightestColor2) 100%, transparent) 80%
				);
				pointer-events: none; /* so the text is still selectable */
			}
		`}
	> p {
		line-height: 1.2rem;
		${(p) =>
			p.$shortenText?.length > 100
				? ''
				: `
 				    margin-bottom: .8rem`}
	}
	> p > img {
		vertical-align: text-bottom;
		margin-right: 0.3rem;
	}
	p > a {
		${(p) =>
			p.$shortenText?.length > 100
				? `
 					z-index: 2;
 					position: absolute;
 					right: 0;
 					`
				: `float: right; `};
	}
`
