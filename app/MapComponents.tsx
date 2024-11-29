 import { getCategories } from '@/components/categories'
 import DrawCategories from '@/components/map/DrawCategories'
 import DrawTransportMaps from '@/components/map/DrawTransportMaps'
 import useDrawBookmarks from './effects/useDrawBookmarks'
 import useDrawOsmFeaturePolygon from './effects/useDrawOsmFeaturePolygon'
 import useDrawTransportAreas from './effects/useDrawTransportAreas'
 import { AddTerrain } from './styles/TerrainChooser'
 import { defaultAgencyFilter } from './transport/AgencyFilter'
 
 // These hooks won't need to handle an undefined "map" object
 function MapComponents({
 	map,
 	vers,
 	transportsData,
 	agencyAreas,
 	isTransportsMode,
 	safeStyleKey,
 	searchParams,
 	hasItinerary,
 	quickSearchFeaturesMap,
 	onSearchResultClick,
 }) {
 	//useDrawCycleHighways(map) now from pmtiles in france.ts
 	useDrawBookmarks(map)
 	useDrawOsmFeaturePolygon(map, vers?.osmFeature, safeStyleKey)
 	return (
 		<>
 			<DrawCategories
 				key="DrawCategories"
 				{...{
 					quickSearchFeaturesMap,
 					categories: getCategories(searchParams)[1],
 					onSearchResultClick,
 					safeStyleKey,
 					map,
 				}}
 			/>
 			{isTransportsMode && (
 				<>
 					<DrawTransportAreas
 						areas={agencyAreas}
 						map={map}
 						agencyFilter={searchParams.gamme || defaultAgencyFilter}
 						safeStyleKey={safeStyleKey}
 					/>
 					<DrawTransportMaps
 						{...{
 							map,
 							transportsData,
 							agencyAreas,
 							safeStyleKey,
 							searchParams,
 							hasItinerary,
 						}}
 					/>
 				</>
 			)}
 			{safeStyleKey === 'france' && (
 				<AddTerrain {...{ map, active: searchParams.relief }} />
 			)}
 		</>
 	)
 }
 
 export default MapComponents
 
 const DrawTransportAreas = ({ map, areas, agencyFilter, safeStyleKey }) => {
 	if (safeStyleKey !== 'transports') return null
 	console.log('orange areas', areas)
 	useDrawTransportAreas(map, areas, agencyFilter)
 	return null
 }
