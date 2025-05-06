'use client'

import { styled } from 'next-yak'
import { dateCool } from '@/app/blog/utils'
import { useEffect, useState } from 'react'

export default function News() {
	const [news, setNews] = useState(null)
	useEffect(() => {
		const doFetch = async () => {
			const request = await fetch('/api/news')
			const json = await request.json()
			setNews(json)
		}
		doFetch()
	}, [setNews])

	const lastMdxSource = news && news[0].descriptionMdx
	return (
		<Section>
			<small>Nouveautés</small>
			{!news ? (
				'Chargement'
			) : (
				<>
					<div>
						<small style={{ color: 'var(--darkColor)' }}>
							{dateCool(news[0].date)}
						</small>
						<h2>{news[0].title}</h2>
						<p dangerouslySetInnerHTML={{ __html: lastMdxSource }} />
					</div>
					<details>
						<summary>
							<small>Voir la suite</small>
						</summary>
						<ol>
							{news.slice(1).map(({ date, title, descriptionMdx }) => (
								<li key={title}>
									<small>{dateCool(date)}</small>
									<h2>{title}</h2>
									<p dangerouslySetInnerHTML={{ __html: descriptionMdx }} />
								</li>
							))}
						</ol>
					</details>
				</>
			)}
		</Section>
	)
}

const Section = styled.section`
	margin-top: 1rem;
	margin-bottom: 0.8rem;
	position: relative;
	> small {
		position: absolute;
		top: -1.1rem;
		left: -0.1rem;
		background: var(--lightestColor);
		color: var(--darkColor);
		padding: 0 0.2rem 0.1rem 0.2rem;

		border-radius: 0.1rem;
	}
	border: 1px solid var(--lighterColor);
	padding: 0 0.6rem;
	border-radius: 0.2rem;
	border-top-left-radius: 0;
	summary {
		line-height: 1.3rem;
		margin-top: -0.3rem;
		margin-right: -0.3rem;
		color: var(--darkColor);
		text-align: right;
	}
	details > ol {
		list-style-type: none;
		padding-left: 0;
		li {
			margin-bottom: 1rem;
		}
	}

	h2 {
		font-size: 100%;
		margin: 0;
	}
	> div > p,
	ol p {
		font-size: 80%;
		line-height: 1.2rem;
		margin: 0;
	}
	ul {
		margin-left: 1rem;
	}
`
