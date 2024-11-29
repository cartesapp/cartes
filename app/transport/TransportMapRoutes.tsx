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
 		<section
 			css={css`
 				position: relative;
 				margin-top: 0.6rem;
 				padding-top: 0.4rem;
 			`}
 		>
 			{routesParam ? (
 				<ModalCloseButton
 					title="Réinitialiser la sélection de lignes"
 					onClick={() => setRoutes(undefined, false)}
 				/>
 			) : (
 				'👉️ Cliquez pour explorer les lignes'
 			)}
 
 			<ol
 				css={css`
 					margin: 1rem 0;
 					list-style-type: none;
 					> li {
 						margin: 0.6rem 0;
 					}
 				`}
 			>
 				{routes.map((route) => {
 					const stopList = route.properties.stopList
 					return (
 						<li
 							key={route.properties.route_id}
 							css={css`
 								a {
 									text-decoration: none;
 									color: inherit;
 								}
 							`}
 						>
 							<Link href={setRoutes(route.properties.route_id)}>
 								<RouteName route={route.properties} />
 							</Link>
 							{route.properties.isNight && <div>🌜️ Bus de nuit</div>}
 							{route.properties.isSchool && <div>🎒 Bus scolaire</div>}
 							<span
 								css={css`
 									margin-right: 1rem;
 								`}
 							>
 								{stopList.length ? (
 									<small>
 										<details open={routes.length === 1}>
 											<summary>Arrêts</summary>
 											<ol
 												css={css`
 													margin-left: 2rem;
 												`}
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
 								css={css`
 									text-align: right;
 									color: gray;
 								`}
 							>
 								Voyages par jour : {Math.round(route.properties.perDay / 2)}.
 								Par heure : {Math.round(route.properties.perDay / 10 / 2)}
 							</small>
 						</li>
 					)
 				})}
 			</ol>
 		</section>
 	)
 }
