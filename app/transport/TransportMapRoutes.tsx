import { styled } from 'next-yak'
import Link from 'next/link'
import { ModalCloseButton } from '../UI'
import { RouteName } from './stop/Route'

export default function Routes({
	routes,
	setRoutes,
	setStopName,
	routesParam,
}) {
	return (
		<Section>
			{routesParam ? (
				<ModalCloseButton
					title="Réinitialiser la sélection de lignes"
					onClick={() => setRoutes(undefined, false)}
				/>
			) : (
				'👉️ Cliquez pour explorer les lignes'
			)}

			<ol>
				{routes.map((route) => {
					const stopList = route.properties.stopList
					return (
						<li key={route.properties.route_id}>
							<Link href={setRoutes(route.properties.route_id)}>
								<RouteName route={route.properties} />
							</Link>
							{route.properties.isNight && <div>🌜️ Bus de nuit</div>}
							{route.properties.isSchool && <div>🎒 Bus scolaire</div>}
							<span style={{ marginRight: '1rem' }}>
								{stopList.length ? (
									<small>
										<details open={routes.length === 1}>
											<summary>Arrêts</summary>
											<ol
												style={{
													marginLeft: '2rem',
												}}
											>
												{stopList.map((stop, index) => (
													<li key={index}>
														<Link href={setStopName(stop)}>{stop}</Link>
													</li>
												))}
											</ol>
										</details>
									</small>
								) : (
									'Direct'
								)}
							</span>
							<small
								style={{
									textAlign: 'right',
									color: 'gray',
								}}
							>
								Voyages par jour : {Math.round(route.properties.perDay / 2)}.
								Par heure : {Math.round(route.properties.perDay / 10 / 2)}
							</small>
						</li>
					)
				})}
			</ol>
		</Section>
	)
}

const Section = styled.section`
	position: relative;
	margin-top: 0.6rem;
	padding-top: 0.4rem;
	ol {
		margin: 1rem 0;
		list-style-type: none;
		> li {
			margin: 0.6rem 0;
			a {
				text-decoration: none;
				color: inherit;
			}
		}
	}
`
