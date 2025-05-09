import { styled } from 'next-yak'
import { updateServerUrl } from '../serverUrls'
import { dateCool } from '../blog/utils'

const url = updateServerUrl + '/dashboard'
console.log(url)
export default async function () {
	const req = await fetch(url)
	const data = await req.json()
	console.log(data)

	return (
		<main>
			<Section>
				<h1>Les dernières mises à jour de Cartes.app</h1>
				<p>
					Ci-dessous, consultez les dernières mises à jour des données qui sont
					utilisées pour cartes.app.
				</p>
				<ol>
					{data.map((item) => (
						<li key={item.service}>
							<header>
								<h2>{item.service}</h2>
							</header>
							<small>{item.technology}</small>
							<div>
								<time dateTime={item.last}>{dateCool(item.last)}</time>
							</div>
						</li>
					))}
				</ol>
			</Section>
		</main>
	)
}

const Section = styled.section`
	ol {
		list-style-type: disc;
		padding-left: 1rem;
		li {
			header {
				display: flex;
				align-items: center;
			}
		}
	}
`
