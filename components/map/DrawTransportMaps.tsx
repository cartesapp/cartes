 import useDrawTransport from '@/app/effects/useDrawTransport'
 import { gtfsServerUrl } from '@/app/serverUrls'
 import {
 	defaultAgencyFilter,
 	getAgencyFilter,
 } from '@/app/transport/AgencyFilter'
 import { defaultTransitFilter } from '@/app/transport/TransitFilter'
 import { filterTransportFeatures } from '@/app/transport/filterTransportFeatures'
 import { sortBy } from '@/components/utils/utils'
 import { memo, useEffect, useMemo, useState } from 'react'
 import { useMediaQuery } from 'usehooks-ts'
 
 export default function DrawTransportMaps({
 	map,
 	transportsData,
 	agencyAreas,
 	safeStyleKey,
 	searchParams,
 	hasItinerary,
 }) {
 	const {
 		routes: routesParam,
 		'type de train': trainType,
 		filtre: transitFilter = defaultTransitFilter,
 		arret: stop,
 		agence: selectedAgency,
 		gamme: agencyFilter = defaultAgencyFilter,
 	} = searchParams
 
 	const [selectedAgencyBbox, setSelectedAgencyBbox] = useState(null)
 	const isMobile = useMediaQuery('(max-width: 800px)')
 
 	useEffect(() => {
 		if (!map) return
 		if (!selectedAgencyBbox) return
 		const bbox = selectedAgencyBbox
 
 		const fitBoundsBbox = [
 			[bbox[0], bbox[1]],
 			[bbox[2], bbox[3]],
 		]
 
 		map.fitBounds(fitBoundsBbox)
 	}, [selectedAgencyBbox, map, isMobile])
 
 	useEffect(() => {
 		if (!selectedAgency) return
 
 		if (selectedAgencyBbox) return
 		if (
 			transportsData &&
 			transportsData.find(([agencyId]) => agencyId === selectedAgency)
 		)
 			return
 
 		const doFetch = async () => {
 			try {
 				const request = await fetch(
 					gtfsServerUrl + '/agencyBbox/' + selectedAgency
 				)
 				const json = await request.json()
 				setSelectedAgencyBbox(json)
 			} catch (e) {
 				console.error('Error fetching agency bbox')
 			}
 		}
 		doFetch()
 	}, [selectedAgency, transportsData, selectedAgencyBbox])
 
 	const agencyIdsHash =
 		transportsData &&
 		sortBy((id) => id)(transportsData.map(([id]) => id)).join('')
 
 	const dataToDraw = useMemo(() => {
 		console.log('memo transport dataToDraw', agencyIdsHash, transportsData)
 		return (
 			transportsData &&
 			transportsData
 				.map(([agencyId, data]) => {
 					if (
 						!selectedAgency &&
 						agencyFilter &&
 						!getAgencyFilter((key) => key === agencyFilter).filter(data)
 					)
 						return false
 					const { bbox, features } = data
 					console.log('orange data', data)
 					if (selectedAgency != null && agencyId !== selectedAgency)
 						return false
 					const filteredFeatures = filterTransportFeatures(features, {
 						routesParam,
 						stop,
 						trainType,
 						transitFilter,
 					})
 					return [agencyId, filteredFeatures, bbox]
 				})
 				.filter(Boolean)
 		)
 	}, [
 		agencyIdsHash,
 		routesParam,
 		stop,
 		trainType,
 		transitFilter,
 		selectedAgency,
 		agencyFilter,
 	])
 
 	if (safeStyleKey !== 'transports') return null
 
 	if (!transportsData) return null
 	return dataToDraw.map(([agencyId, features, bbox]) => (
 		<DrawTransportMapMemo
 			key={agencyId}
 			agencyId={agencyId}
 			features={features}
 			map={map}
 			drawKey={'transitMap-agency-' + agencyId + (trainType || '')}
 			hasItinerary={hasItinerary}
 			bbox={bbox}
 		/>
 	))
 }
 
 const DrawTransportMap = ({ map, features, hasItinerary, bbox, drawKey }) => {
 	console.log('orange draw or redraw ', drawKey, features.length)
 	useDrawTransport(map, features, drawKey, hasItinerary, bbox)
 	return null
 }
 
 const DrawTransportMapMemo = memo(
 	DrawTransportMap,
 	({ drawKey }, { drawKey: key2 }) => {
 		return drawKey === key2
 	}
 )
