 import {css} from 'next-yak'
 import Link from 'next/link'
 import { PresentationWrapper } from '../presentation/UI'
 import regionsRaw from './regions.yaml'
 const regions = sortBy((r) => r.nom)(regionsRaw)
 import regionsAoms from './regionsAoms.yaml'
 import { Ul } from './UI'
 import { sortBy } from '@/components/utils/utils'
 import { gtfsServerUrl } from '../serverUrls'
 import StaticPageHeader from '@/components/StaticPageHeader'
 
 const title = 'Transports en commun'
 const description = `
 Découvrez les plans de chaque réseau de transport en commun en France,
 et calculez vos itinéraires en bus, en tram, en métro, en train (TER,
 Intercités, TGV, Ouigo, train de nuit) et la combinaison multimodale
 des transports publics avec le vélo et la marche.
 `
 
 export const metadata: Metadata = {
 	title,
 	description,
 }
 export default async function () {
 	const onlineAgenciesRequest = await fetch(gtfsServerUrl + '/agencies', {
 		cache: 'no-store',
 	})
 	const json = await onlineAgenciesRequest.json()
 	const agencies = Object.values(json).map((el) => el.agency)
 
 	const panRequest = await fetch('https://transport.data.gouv.fr/api/datasets/')
 	const datasets = await panRequest.json()
 	const enriched = datasets
 		.map((dataset) => {
 			const firstGtfs = dataset.resources.find(
 				(resource) => resource.format === 'GTFS'
 			)
 			if (!firstGtfs) return
 
 			const { networks } = firstGtfs.metadata || { networks: [] }
 			const agencyIds = networks
 				.map(
 					(network) =>
 						agencies.find((agency) => agency.agency_name === network)?.agency_id
 				)
 				.filter(Boolean)
 
 			const france = dataset.covered_area?.country?.name
 			const isRegion = dataset.covered_area?.region?.name
 			const aomSiren = dataset.aom?.siren
 			const aomName = dataset.aom?.name
 			const citiesName =
 				dataset.covered_area?.type === 'cities' && dataset.covered_area.name
 
 			if (![france, isRegion, aomSiren, citiesName].some(Boolean))
 				console.log(dataset.covered_area)
 			return {
 				...dataset,
 				isRegion,
 				aomSiren,
 				aomName,
 				france,
 				citiesName,
 				agencyIds,
 			}
 		})
 		.filter(Boolean)
 
 	const national = enriched.filter((dataset) => dataset.france)
 
 	const aoms = enriched.filter((dataset) => dataset.aomSiren),
 		enrichedAoms = await Promise.all(
 			aoms.map(async (dataset) => {
 				const { region } = regionsAoms.find(
 					({ siren }) => siren == dataset.aomSiren
 				)
 				return {
 					...dataset,
 					region,
 				}
 			})
 		)
 
 	return (
 		<PresentationWrapper>
 			<StaticPageHeader small={true} />
 			<header>
 				<h1>{title}</h1>
 				<p>{description}</p>
 			</header>
 
 			<section
 				css={css`
 					margin: 2rem 0;
 				`}
 			>
 				{' '}
 				<p>
 					Les réseaux de transport en commun sont ajoutés progressivement sur
 					Cartes.
 				</p>
 				<p>
 					Dans la liste ci-dessous, un lien signifie que le réseau est intégré.
 					Le vôtre n'y est pas ?{' '}
 					<a href="https://github.com/cartesapp/serveur?tab=readme-ov-file#couverture">
 						Venez aider !
 					</a>
 				</p>
 				<section
 					css={css`
 						margin-top: 3vh;
 						background: var(--lightestColor);
 						padding: 0.1rem 1rem 2rem;
 						border-radius: 0.6rem;
 					`}
 				>
 					<h2>Sommaire</h2>
 					<h3>Réseaux nationaux</h3>
 					<Link href={'/transport-en-commun#national'}>
 						Les réseaux qui parcourent la France (train, car)
 					</Link>
 					<h3>Régions</h3>
 					<Ul>
 						{regions.map(({ code, nom }, i) => (
 							<li key={code}>
 								<Link href={`/transport-en-commun#${code}`}>{nom}</Link>{' '}
 							</li>
 						))}
 					</Ul>
 				</section>
 				<h2 id="national">Réseaux nationaux</h2>
 				<Ul>
 					{national.map((dataset) => (
 						<DatasetItem
 							dataset={dataset}
 							key={dataset.slug}
 							agencies={agencies}
 						/>
 					))}{' '}
 				</Ul>
 				<h2>Réseaux par région</h2>
 				<Ul $borderBottom={true}>
 					{regions.map(({ code, nom }, i) => {
 						const main = enriched.find((dataset) => dataset.isRegion === nom)
 						return (
 							<li key={code}>
 								<h3 id={code}>{nom}</h3>
 								{main && (
 									<>
 										<h4>Réseau régional unifié</h4>
 
 										<Ul>
 											<DatasetItem
 												dataset={main}
 												key={main.slug}
 												agencies={agencies}
 											/>
 										</Ul>
 										<h4>Réseaux locaux</h4>
 									</>
 								)}
 								<Ul>
 									{enrichedAoms
 										.filter((aom) => aom.region === nom)
 										.map((dataset) => (
 											<DatasetItem
 												dataset={dataset}
 												key={dataset.slug}
 												agencies={agencies}
 											/>
 										))}
 								</Ul>
 							</li>
 						)
 					})}
 				</Ul>
 			</section>
 		</PresentationWrapper>
 	)
 }
 
 const DatasetItem = ({ dataset, agencies }) => {
 	if (dataset.agencyIds.length > 0) {
 		return (
 			<li>
 				<div>{dataset.title}</div>
 				<Ul>
 					{dataset.agencyIds.map((id) => (
 						<li key={id}>
 							<Link prefetch={false} href={`/?style=transports&agence=${id}`}>
 								{agencies.find((agency) => agency.agency_id === id).agency_name}
 							</Link>
 						</li>
 					))}
 				</Ul>{' '}
 			</li>
 		)
 	}
 	return <li>{dataset.title}</li>
 }
