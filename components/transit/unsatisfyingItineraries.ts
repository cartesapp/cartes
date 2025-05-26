export function unsatisfyingItineraries(json, itineraryDistance) {
	if (!json.itineraries.length) return true

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

	console.log('cyan unsatisfyingItineraries', json, speed)
	if (speed < 20) return true

	//TODO we could use here more sophisticated algorithms to solve the frequent
	//problem of buses that make detours just to take a train. It's easy if the
	//detour is replacable by the bike max time set in useFetchItinerary, but it
	//would fail by just one minute ! We'd have to analyse the shape of the
	//transit.
}
