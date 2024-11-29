 import useSetSearchParams from '@/components/useSetSearchParams'
 import Link from 'next/link'
 import Image from 'next/image'
 import DateSelector from '../itinerary/DateSelector'
 import SncfSelect from './SncfSelect'
 import TransitFilter, { transitFilters } from './TransitFilter'
 import { sortBy, unique } from '@/components/utils/utils'
 import StopByName from './StopByName'
 import { ModalCloseButton } from '../UI'
 import Routes from './TransportMapRoutes'
 import { PlaceButton } from '../PlaceButtonsUI'
 import AgencyFilter from './AgencyFilter'
 
 export default function TransportMap({
 	day,
 	data,
 	selectedAgency,
 	routesParam,
 	trainType,
 	transitFilter,
 	agencyFilter,
 	stop,
 	bbox,
 	setIsItineraryMode,
 }) {
 	const bboxAgencies = data
 
 	const setSearchParams = useSetSearchParams()
 
 	const setTransitFilter = (filter) => setSearchParams({ filtre: filter })
 	const setAgencyFilter = (filter) => setSearchParams({ gamme: filter })
 
 	const setTrainType = (trainType) =>
 		setSearchParams({ 'type de train': trainType })
 
 	const resetStop = () => setSearchParams({ arret: undefined })
 	/* async, not needed yet since the agency data includes routes
 	useEffect(() => {
 		if (!routesParam || !data) return setRoutes([])
 
 		const doFetch = async () => {
 			const request = await fetch(`${gtfsServerUrl}/routes/${routesParam}`)
 			const json = await request.json()
 
 			setRoutes(json)
 		}
 		doFetch()
 
 	}, [routesParam, setRoutes, data])
     */
 
 	const transitFilterFunction = transitFilters.find(
 		([key]) => key === transitFilter
 	)[1].filter
 
 	const routesDemanded = routesParam?.split('|')
 	const rand = Math.random()
 	console.time('routes' + rand)
 
 	const routes =
 		!stop &&
 		(selectedAgency || routesDemanded) &&
 		sortBy((route) => -route.properties.perDay)(
 			bboxAgencies.reduce((memo, [agencyId, { features }]) => {
 				if (selectedAgency != null && agencyId !== selectedAgency) return memo
 				const filteredFeatures = features.filter(transitFilterFunction)
 				const found = filteredFeatures.filter((feature, i) => {
 					if (routesDemanded)
 						return routesDemanded.includes(feature.properties.route_id)
 					else {
 						if (feature.geometry.type !== 'LineString') return
 
 						if (i === 0) console.log('transportmap feature', feature)
 
 						const hasCoordinateInBbox = !bbox
 							? true
 							: feature.geometry.coordinates.some(
 									([lon, lat]) =>
 										lon > bbox[0][0] &&
 										lon < bbox[1][0] &&
 										lat > bbox[0][1] &&
 										lat < bbox[1][1]
 							  )
 						return hasCoordinateInBbox
 					}
 				})
 				return [...memo, ...found]
 			}, [])
 		)
 	console.timeLog('routes' + rand)
 	//const routeIds = routes && routes.map((route) => route.properties.route_id)
 	//	console.log('routes', routeIds, unique(routeIds))
 
 	const selectedAgencyData =
 		selectedAgency &&
 		bboxAgencies?.length > 0 &&
 		bboxAgencies.find(([id]) => id === selectedAgency)
 	return (
 		<section
 			css={css`
 				h1 {
 					margin-top: 1rem;
 					margin-bottom: -0.1rem;
 					line-height: 1.6rem;
 					font-size: 170%;
 				}
 			`}
 		>
 			<section>
 				{!selectedAgencyData && (
 					<header>
 						<h1>Plans de transport en commun</h1>
 						<Link href="/transport-en-commun">
 							<small>Quels réseaux sont intégrés sur Cartes ? </small>
 						</Link>
 					</header>
 				)}
 
 				{false && <DateSelector type="day" date={day} />}
 				{!stop && !selectedAgency && (
 					<AgencyFilter {...{ agencyFilter, setAgencyFilter }} />
 				)}
 				{!stop &&
 					(agencyFilter === 'train' || selectedAgency == '1187' ? (
 						<SncfSelect {...{ bboxAgencies, setTrainType, trainType }} />
 					) : (
 						<TransitFilter
 							{...{ data: bboxAgencies, setTransitFilter, transitFilter }}
 						/>
 					))}
 				<PlaceButton
 					as="div"
 					css={css`
 						margin-top: 0.8rem;
 						margin-bottom: 0.6rem;
 						text-align: right;
 					`}
 				>
 					<button onClick={() => setIsItineraryMode(true)}>
 						<div>
 							<Image
 								src="/itinerary.svg"
 								width="50"
 								height="50"
 								alt="Lancer le mode itinéraire"
 							/>
 						</div>
 						<div>Itinéraire</div>
 					</button>
 				</PlaceButton>
 				{selectedAgency == null && bboxAgencies?.length > 0 && (
 					<section>
 						<p>Dans cette zone : </p>
 						<ol
 							css={css`
 								margin-left: 0.6rem;
 								list-style-type: none;
 								a {
 									color: var(--color);
 									text-decoration-color: var(--lighterColor);
 								}
 							`}
 						>
 							{bboxAgencies.map(([agencyId, { agency }]) => (
 								<li key={agencyId}>
 									<Link href={setSearchParams({ agence: agencyId }, true)}>
 										{agency.agency_name}
 									</Link>
 								</li>
 							))}
 						</ol>
 					</section>
 				)}
 			</section>
 			{stop && (
 				<section
 					css={css`
 						position: relative;
 						padding-top: 0.6rem;
 					`}
 				>
 					<ModalCloseButton
 						title="Fermer l'encart arrêt de transport"
 						onClick={() => {
 							setSearchParams({ arret: undefined })
 						}}
 					/>
 					<h2>{stop}</h2>
 					{bboxAgencies?.length > 0 && (
 						<StopByName stopName={stop} data={bboxAgencies} />
 					)}
 				</section>
 			)}
 			{!routesDemanded && selectedAgencyData && (
 				<Agency
 					data={selectedAgencyData[1]}
 					backUrl={setSearchParams({ agence: undefined }, true)}
 				/>
 			)}
 
 			{routes && (
 				<Routes
 					routesParam={routesParam}
 					routes={routes}
 					setRoutes={(routes, url = true) => setSearchParams({ routes }, url)}
 					setStopName={(stopName, url = true) =>
 						setSearchParams({ arret: stopName }, url)
 					}
 				/>
 			)}
 		</section>
 	)
 }
 
 const Agency = ({ data, backUrl }) => {
 	return (
 		<section>
 			<Link href={backUrl}>← Retour à la liste des plans des réseaux</Link>
 			<h1>{data.agency.agency_name}</h1>
 		</section>
 	)
 }
