export function unsatisfyingItineraries(json, itineraryDistance) {
	const bikeDistance =
		json.direct &&
		json.direct.length &&
		json.direct[0].legs.reduce((memo, next) => memo + next.distance, 0)
	const distance = bikeDistance || itineraryDistance
	const fastest = json.itineraries.reduce((memo, next) => {
		if (next.duration < memo.duration) return next
		else return memo
	}, json.itineraries[0])
	const speed = distance / (fastest.duration / (60 * 60))

	if (speed < 20) return true
	console.log('cyan unsatisfyingItineraries', json, speed)
	if (!json.itineraries.length) return true
}
