import { gtfsServerUrl, motisServerUrl } from '@/app/serverUrls'
import {
	decodeStepModeParams,
	stepModeParamsToMotis,
} from '@/components/transit/modes'
import { lightenColor } from '@/components/utils/colors'
import { distance, point } from '@turf/turf'
import { handleColor, trainColors } from './colors'
import transportIcon, {
	isMotisTrainMode,
} from '@/components/transit/modeCorrespondance'
import { defaultRouteColor, nowStamp, stamp } from './utils'

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

	const requestDistance = distance(
		point([start.lng, start.lat]),
		point([destination.lng, destination.lat])
	)

	const { start: startModeParam, end: endModeParam } =
		decodeStepModeParams(searchParams)

	const startModes = stepModeParamsToMotis(startModeParam, requestDistance)
	const destinationModes = stepModeParamsToMotis(endModeParam, requestDistance)

	console.log('itinerary distance', requestDistance)

	const body = {
		timetableView: preTrip,
		fromPlace: [
			start.lat,
			start.lng, //TODO start.z is supported by Motis
		],
		toPlace: [destination.lat, destination.lng],
		//searchWindow: 6 * 60 * 60, //hours by default but 8 hours if telescope ?
		//previously in v1 : end = datePlusHours(date, 1) // TODO This parameter should probably be modulated depending on the transit offer in the simulation setup. Or, query for the whole day at once, and filter them in the UI
		time: date + '00.000Z',
		...startModes,
		...destinationModes,
		// for pretrip mode :
		//min_connection_count: 5,
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
		//extend_interval_earlier: true,
		//extend_interval_later: true,
		...(correspondances == null
			? {}
			: {
					maxTransfers: +correspondances,
			  }),
		...(tortue
			? {
					transferTimeFactor: tortue,
			  }
			: {}),
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
	console.log('indigo motis body', body)

	try {
		const request = await fetch(
			motisServerUrl + '/api/v2/plan?' + new URLSearchParams(body).toString(),
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
			}
		)
		if (!request.ok) {
			console.error('Error fetching motis server')
			const json = await request.json()
			console.log('cyan', json)

			const motisReason = json.content?.reason
			const reason = errorCorrespondance[motisReason]

			return { state: 'error', reason }
		}
		const json = await request.json()
		console.log('indigo motis', json)
		console.log('motis statistics', JSON.stringify(json.debugOutput))

		const augmentedItineraries = await Promise.all(
			json.itineraries.map(async (itinerary) => {
				const { legs } = itinerary
				const augmentedLegs = await Promise.all(
					legs.map(async (leg) => {
						const { tripId: rawTripId } = leg
						if (!rawTripId) return leg

						const tripId = rawTripId.replace(
							/(\d\d\d\d\d\d\d\d_\d\d:\d\d)_(.+)\|([^_]+)\_(.+)/,
							(correspondance, p0, p1, p2, p3, decalage, chaine) => p1 + p3
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
						console.log(
							'indigo motis augmented',
							Object.entries(gtfsAttributes).filter(([k, v]) => v != null),
							Object.entries(leg).filter(([k, v]) => v != null)
						)
						const { route_color, route_text_color, route_type } =
								gtfsAttributes,
							isTrain = isMotisTrainMode(leg.mode)

						const isBretagneTGV = tripId.startsWith('bretagne_SNCF2')

						const isOUIGO =
							leg.from.stopId.includes('OUIGO') ||
							leg.to.stopId.includes('OUIGO') // well, on fait avec ce qu'on a
						const isTGVStop =
							leg.from.stopId.includes('TGV INOUI') ||
							leg.to.stopId.includes('TGV INOUI') // well, on fait avec ce qu'on a
						const isTGV = isTGVStop || isBretagneTGV

						//TODO this should be a configuration file that sets not only main
						//colors, but gradients, icons (ouigo, inoui, tgv, ter, etc.)
						const sourceGtfs = tripId.split('_')[0],
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

						const shortName = frenchTrainType || leg.routeShortName
						return {
							...leg,
							...attributes,
							routeColorDarker: attributes.route_color
								? lightenColor(attributes.route_color, -20)
								: '#5b099f',
							tripId,
							frenchTrainType,
							shortName,
						}
					})
				)
				/* TODO, useless now, v1 had no duration agregaed value ?
				const seconds = augmentedLegs.reduce(
					(memo, next) => memo + next.seconds,
					0
				)
				*/

				return {
					...itinerary,
					legs: augmentedLegs,
				}
			})
		)
		const augmentedResponse = {
			...json,
			itineraries: augmentedItineraries,
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

export { stamp }

export const notTransitType = ['WALK', 'BIKE', 'CAR']
export const isNotTransitItinerary = (itinerary) =>
	itinerary.legs.every((leg) => notTransitType.includes(leg.mode))
