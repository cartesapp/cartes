import { styled } from 'next-yak'
import news from './news.yaml'
import { dateCool } from '@/app/blog/utils'

export default function News() {
	return (
		<Section>
			<small>Nouveautés</small>
			<div>
				<small style={{ color: 'var(--darkColor)' }}>
					{dateCool(news[0].date)}
				</small>
				<h2>{news[0].title}</h2>
				<p>
					<small>{news[0].description}</small>
				</p>
			</div>
			<details>
				<summary>
					<small>Voir la suite</small>
				</summary>
				<ol>
					{news.slice(1).map(({ date, title, description }) => (
						<li key={title}>
							<small>{dateCool(date)}</small>
							<h2>{title}</h2>
							<p>
								<small>{description}</small>
							</p>
						</li>
					))}
				</ol>
			</details>
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
	ol {
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
	p {
		margin: 0;
	}
`
