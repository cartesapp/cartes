import { styled } from 'next-yak'
import { updateServerUrl } from '../serverUrls'
import { dateCool } from '../blog/utils'

const url = updateServerUrl + '/dashboard'
console.log(url)
export default async function () {
	const req = await fetch(url, { cache: 'no-store' })
	const data = await req.json()
	console.log(data)

	return (
		<Main>
			<Section>
				<h1>Les dernières mises à jour de Cartes.app</h1>
				<p>
					Ci-dessous, consultez les dernières mises à jour des données qui sont
					utilisées pour cartes.app.
				</p>
				<StyledList>
					{data.map((item) => (
						<ListItem key={item.service}>
							<Header>
								<h2>{item.service}</h2>
							</Header>
							<SmallText>{item.technology}</SmallText>
							<div>
								<Time dateTime={item.last}>{dateCool(item.last)}</Time>
							</div>
						</ListItem>
					))}
				</StyledList>
			</Section>
		</Main>
	)
}

const Main = styled.main`
	background-color: #f9f9f9;
	padding: 2rem;
	border-radius: 8px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`

const Section = styled.section``

const StyledList = styled.ol`
	list-style-type: none;
	padding: 0;
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-top: 2rem;
`

const ListItem = styled.li`
	background-color: #fff;
	margin-bottom: 1rem;
	padding: 1rem;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	flex: 1 1 calc(50% - 1rem);
	box-sizing: border-box;
	min-width: 12rem;
	header {
		display: flex;
		align-items: center;
	}
`

const Header = styled.header`
	display: flex;
	align-items: center;
	margin-bottom: 0.5rem;
	h2 {
		margin: 0;
		font-size: 1.2rem;
		color: #333;
	}
`

const SmallText = styled.small`
	color: #777;
	font-size: 0.9rem;
`

const Time = styled.time`
	color: #555;
	font-size: 0.9rem;
`
