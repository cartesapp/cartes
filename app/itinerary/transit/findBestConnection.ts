import { humanDepartureTime } from '../../transport/stop/Route'
import { notTransitType } from './motisRequest'
import { humanDuration, stamp } from './utils'

const isDirectTransitConnection = (connection) =>
	connection.legs.filter((leg) => !notTransitType.includes(leg.mode)).length ===
	1

export default function findBestConnection(connections) {
	console.log('bestConnection connections', connections)

	/*
	 * Very simple algorithm to find a best candidate
	 * to be highlighted at the top
	 * */
	const selected = connections
		// walk segments don't have trips. We want a direct connection, only one trip
		.filter(isDirectTransitConnection)
		//TODO this selection should probably made using distance, not time. Or both.
		//it's ok to walk 20 min, and take the train for 10 min, if the train goes at
		//200 km/h
		.filter((connection) => {
			const walking = connection.legs.filter(
					(transport) => transport.mode === 'WALK'
				),
				walkingTime = walking.reduce((memo, next) => memo + next.seconds, 0)

			return (
				walkingTime <
				// experimental, not optimal at all. See note above
				// TODO compute according to transit/modes/decodeStepModeParams !
				2 *
					connection.legs.find(
						(transport) => !notTransitType.includes(transport.mode)
					).seconds
			)
		})
	console.log('bestConnection selected', selected)
	if (!selected.length) return null

	const best = selected.reduce((memo, next) => {
		if (memo === null) return next
		if (next.duration < memo.duration) return next
		return memo
	}, null)

	const nextDepartures = selected
		.filter((connection) => bestSignature(connection) === bestSignature(best))
		.map((connection) => {
			try {
				const date = new Date(connection.startTime)
				if (stamp(connection.startTime) < stamp()) return false
				const humanTime = humanDepartureTime(date, true)
				return humanTime
			} catch (e) {
				console.log('Error building best connection next departures', e)
			}
		})
		.filter(Boolean)

	console.log('bestConnection next departures', nextDepartures)
	// This is arbitrary. It helps us exclude the display of the "best connection"
	// bloc in the case of onTrip requests. We could also just compute the onTrip
	// status as a criteria, but who knows, maybe this mode can produce a best
	// connection with 3 next departures in some cases ?
	if (nextDepartures.length < 2) return null

	return {
		best,
		interval: getBestIntervals(connections, best),
		nextDepartures,
	}
}

export const bestSignature = (connection) => connection.routeShortName

export const getBestIntervals = (connections, best) => {
	const bests = connections.filter(
		(connection) =>
			isDirectTransitConnection(connection) &&
			bestSignature(connection) === bestSignature(best)
	)
	const departures = bests.map((connection) => connection.startTime)

	if (departures.length === 1) return 'une fois par jour'

	const intervals = departures
		.map((date, i) => i > 0 && stamp(date) - stamp(departures[i - 1]))
		.filter(Boolean)
	const max = Math.max(...intervals)

	console.log('orange max', max, intervals)
	const description = humanDuration(max).interval
	return description
}

const removeDans = (dans) => (s) => dans ? s.replace('dans ', '') : s
const removeÀ = (à) => (s) => à ? s.replace('à ', '') : s
export const nextDeparturesSentence = (departures) => {
	let dans = false,
		à = false

	return departures
		.slice(0, 4)
		.map((departure) => {
			const lower = departure.toLowerCase()
			const result = removeDans(dans)(removeÀ(à)(lower))
			if (lower.includes('dans ')) dans = true
			if (lower.includes('à ')) à = true
			return result
		})
		.join(', ')
}
