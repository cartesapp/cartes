import { gtfsServerUrl, motisServerUrl } from '@/app/serverUrls'
import {
	decodeStepModeParams,
	stepModeParamsToMotis,
} from '@/components/transit/modes'
import { lightenColor } from '@/components/utils/colors'
import { distance, point } from '@turf/turf'
import transportIcon from './transportIcon'
import { datePlusHours, defaultRouteColor, nowStamp, stamp } from './utils'

// For onTrip, see https://github.com/motis-project/motis/issues/471#issuecomment-2247099832
const buildRequestBody = (start, destination, date, searchParams) => {
	const { correspondances, planification, tortue } = searchParams

	// TODO How to set planification ? How to trigger the appearance of the setter
	// button ?
	const forcePreTrip = planification === 'oui'

	const now = nowStamp(),
		dateStamp = stamp(date),
		difference = dateStamp - now,
		threshold = 60 * 60 //... seconds = 1h

	const preTrip =
		forcePreTrip ||
		//!debut && // not sure why debut
		difference >= threshold // I'm afraid the onTrip mode, though way quicker, could result in only one result in some cases. We should switch to preTrip in thoses cases, to search again more thoroughly

	const begin = Math.round(new Date(date).getTime() / 1000),
		end = datePlusHours(date, 1) // TODO This parameter should probably be modulated depending on the transit offer in the simulation setup. Or, query for the whole day at once, and filter them in the UI

	console.log(
		'lightgreen motis time range',
		new Date(begin * 1000),
		new Date(end * 1000)
	)

	const requestDistance = distance(
		point([start.lng, start.lat]),
		point([destination.lng, destination.lat])
	)

	const { start: startModeParam, end: endModeParam } =
		decodeStepModeParams(searchParams)
	const start_modes = stepModeParamsToMotis(startModeParam, requestDistance)
	const destination_modes = stepModeParamsToMotis(endModeParam, requestDistance)

	console.log('itinerary distance', requestDistance)

	const body = {
		destination: { type: 'Module', target: '/intermodal' },
		content_type: 'IntermodalRoutingRequest',
		content: {
			start_type: !preTrip ? 'IntermodalOntripStart' : 'IntermodalPretripStart',
			start: !preTrip
				? {
						position: start,
						departure_time: begin,
				  }
				: {
						position: start,
						interval: {
							begin,
							end,
						},
						min_connection_count: 5,
						/* Update nov 2024 : the doc is not online anymore, Motis v2 is the
						 * way to go. Setting it to 5 in pretrip now that we have a default
						 * onTrip. We'll see this matter again for the migration */
						/* I do not understand these options. E.g. in Rennes, from 16h30 to
						 * 18h30, setting this and min_connection_count to 5 leads to results
						 * at 23h30 ! Way too much.
						 * https://motis-project.de/docs/features/routing.html#intermodal-and-timetable-routing-from-door-to-door
						 * Also this issue : https://github.com/motis-project/motis/issues/443#issuecomment-1951297984
						 * Is 5 "pareto optimal" connections asking much ? I don't understand
						 * what it is. Hence we set it to 1.
						 */
						extend_interval_earlier: true,
						extend_interval_later: true,
				  },
			start_modes,
			destination_type: 'InputPosition',
			destination,
			destination_modes,
			search_type: 'Default',
			search_dir: 'Forward',
			router: '',
			max_transfers: correspondances == null ? -1 : +correspondances,
			...(tortue
				? {
						transfer_time_factor: tortue,
				  }
				: {}),
		},
	}
	return body
}

const errorCorrespondance = {
	'access: timestamp not in schedule':
		'Notre serveur a eu un problème de mise à jour des données de transport en commun :-/',
}
export const computeMotisTrip = async (
	start,
	destination,
	date,
	searchParams = {}
) => {
	const body = buildRequestBody(start, destination, date, searchParams)
	console.log('indigo motis', body)

	try {
		const request = await fetch(motisServerUrl, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		})
		if (!request.ok) {
			console.error('Error fetching motis server')
			const json = await request.json()
			console.log('cyan', json)

			const motisReason = json.content?.reason
			const reason = errorCorrespondance[motisReason]

			return { state: 'error', reason }
		}
		const json = await request.json()
		console.log('motis', json)
		console.log('motis statistics', JSON.stringify(json.content.statistics))

		const augmentedConnections = await Promise.all(
			json.content.connections.map(async (connection) => {
				const { trips, stops, transports } = connection
				const augmentedTransports = await Promise.all(
					transports.map(async (transport) => {
						const trip = trips.find(
							(trip) => trip.id.line_id === transport.move.line_id
						)

						console.log('red debug', trip?.id)
						const tripId = trip?.id.id.replace(
							/(.+)\|([^_]+)\_(.+)/,
							(correspondance, p1, p2, p3, decalage, chaine) => p1 + p3
						)
						const doFetch = async () => {
							try {
								if (!tripId) return {}
								const request = await fetch(
									`${gtfsServerUrl}/routes/trip/${encodeURIComponent(tripId)}`
								)
								const json = await request.json()
								const safeAttributes = json.routes[0] || {}
								return safeAttributes
							} catch (e) {
								console.error('Unable to fetch route color from GTFS server')
								return {}
							}
						}
						const gtfsAttributes = await doFetch()
						const { route_color, route_text_color, route_type } =
								gtfsAttributes,
							isTrain = route_type === 2

						const isBretagneTGV = trip?.id.id.startsWith('bretagne_SNCF2')

						const isOUIGO =
							trip?.id.station_id.includes('OUIGO') ||
							trip?.id.target_station_id.includes('OUIGO') // well, on fait avec ce qu'on a
						const isTGVStop =
							trip?.id.station_id.includes('TGV INOUI') ||
							trip?.id.target_station_id.includes('TGV INOUI') // well, on fait avec ce qu'on a
						const isTGV = isTGVStop || isBretagneTGV

						//TODO this should be a configuration file that sets not only main
						//colors, but gradients, icons (ouigo, inoui, tgv, ter, etc.)
						const sourceGtfs = trip?.id.id.split('_')[0],
							prefix = sourceGtfs && sourceGtfs.split('|')[0],
							frenchTrainType = isOUIGO
								? 'OUIGO'
								: isTGV
								? 'TGV'
								: prefix
								? prefix === 'fr-x-sncf-ter'
									? 'TER'
									: prefix === 'fr-x-sncf-tgv'
									? 'TGV'
									: prefix === 'fr-x-sncf-intercites'
									? 'INTERCITES'
									: isTrain && !prefix.startsWith('fr-x-sncf')
									? 'TER'
									: null
								: null

						const customAttributes = {
							route_color: isTGV
								? trainColors.TGV['color']
								: isOUIGO
								? trainColors.OUIGO['color']
								: frenchTrainType === 'TER'
								? trainColors.TER['color']
								: handleColor(route_color, defaultRouteColor),
							route_text_color: isTGV
								? '#fff'
								: isOUIGO
								? '#fff'
								: handleColor(route_text_color, '#000000'),
							icon: transportIcon(frenchTrainType, prefix),
						}
						const attributes = {
							...gtfsAttributes,
							...customAttributes,
						}

						/* Temporal aspect */
						const fromStop = stops[transport.move.range.from]
						const toStop = stops[transport.move.range.to]

						const seconds = toStop.arrival.time - fromStop.departure.time
						const name = transport.move.name
						const shortName =
							frenchTrainType ||
							(name?.startsWith('Bus ') ? name.replace('Bus ', '') : name)
						return {
							...transport,
							...attributes,

							route_color_darker: attributes.route_color
								? lightenColor(attributes.route_color, -20)
								: '#5b099f',
							trip,
							tripId,
							frenchTrainType,
							seconds,
							shortName,
						}
					})
				)
				const seconds = augmentedTransports.reduce(
					(memo, next) => memo + next.seconds,
					0
				)

				return { ...connection, transports: augmentedTransports, seconds }
			})
		)
		const augmentedResponse = {
			...json,
			content: {
				...json.content,
				connections: augmentedConnections,
			},
		}
		return augmentedResponse
	} catch (e) {
		// Can happen when no transit found, the server returns a timeout
		// e.g. for Rennes -> Port Navalo on a sunday...
		// Erratum : there was a problem on the server. Anyway, this error state is
		// useful
		console.error('Error fetching motis server', e)
		return { state: 'error' }
	}
}

export const trainColors = {
	TGV: { color: '#b8175e' },
	OUIGO: { color: '#e60075', border: '#0096ca' },
	'Train TER': { color: '#004da4' },
	TER: { color: '#004da4' },
	'TGV INOUI': { color: '#9b2743' },
	'INTERCITES de nuit': { color: '#28166f' },
	INTERCITES: { color: 'Teal' },
	'Car TER': { color: '#004da4', pointillés: true },
	Car: { color: '#004da4', pointillés: true },
	Lyria: { color: '#eb0a28' },
	ICE: { color: '#f01414' },
	TramTrain: { color: '#004da4' },
	Navette: { color: '#004da4', pointillés: true },
}
export function handleColor(rawColor, defaultColor) {
	if (!rawColor) return defaultColor
	if (rawColor.startsWith('#')) return rawColor
	if (rawColor.match(/^([0-9A-Fa-f])+$/) && rawColor.length === 6)
		return '#' + rawColor
	console.log('Unrecognized route color', rawColor)
	return defaultColor
}
export { stamp }

const notTransitType = ['Walk', 'Cycle', 'Car']
export const isNotTransitConnection = (connection) =>
	connection.transports.every((transport) =>
		notTransitType.includes(transport.move_type)
	)
