import { computeMotisTrip } from '@/app/itinerary/transit/motisRequest'

// If no mode is set by the user, we're trying to provide a multimodal view
// that covers a large range of possibilities, giving the user perspectives
// that we cannot guess precisely.
//
// Motis v1 (outdated)
// This is the state of the art of our comprehension of how to use Motis to
// produce useful intermodal results in France, letting the user find the
// closest train station for more long range requests
// See https://github.com/cartesapp/cartes/issues/416
//
// Here we set a threshold in km (50) for either not asking a trip starting with a bike
// segment because we expect the user will use local transit, or ask it with a
// max bike duration request depending on the distance :
// 1h of bike ~= 20km for trips lower than 200 km
// 2h and 40 km for trips more than 200 km
//
// With thiese settings, we should cover most of the hexagone.
//const bikeTrainSearchDistance = //0 * 60
//	hours(distance < 10 ? 0 : distance < 200 ? 1 : 2)
//
// **Motis v2** cannot set a specific max_duration per pre-transit mode. It's
// shared. So we cannot ask Motis to give us walk trips with max 10 minutes walk
// + bike trips with 30 minutes, for our "by default" large cover mode
//
// WALK is 2 km/h
// BIKE is 20 km/h, x10
// CAR is 50 to 100 km/h, x3 to x5, so final x 30 or x 50
//
// This leads to the necessity to make multiple parallel requests and then
// analyse and summarize the results

const computeDistanceAndSpeed = (json, itineraryDistance) => {
	const realDistance =
		json.direct &&
		json.direct.length &&
		json.direct[0].legs.reduce((memo, next) => memo + next.distance, 0)

	const distance = realDistance || itineraryDistance

	const fastest = json.itineraries?.reduce((memo, next) => {
		if (next.duration < memo.duration) return next
		else return memo
	}, json.itineraries[0])

	const speed = fastest && distance / (fastest.duration / (60 * 60))
	//TODO we could use here more sophisticated algorithms to solve the frequent
	//problem of buses that make detours just to take a train. It's easy if the
	//detour is replacable by the bike max time set in useFetchItinerary, but it
	//would fail by just one minute ! We'd have to analyse the shape of the
	//transit.

	console.log('cyan unsatisfyingItineraries', json, speed)
	return [distance, speed]
}

export async function smartMotisRequest(
	searchParams,
	itineraryDistance,
	start,
	destination,
	date,
	setSearchParams
) {
	console.log('cyan itineraryDistance', itineraryDistance)
	const json = await computeMotisTrip(start, destination, date, searchParams)
	if (json.state === 'error') return json

	const has = json?.itineraries.length > 0,
		[distance, speed] = computeDistanceAndSpeed(json, itineraryDistance),
		hasQuickEnough = has && speed > 10 //TODO To adjust

	if (hasQuickEnough) return json

	// the initial WALK request to find door-to-door no-bike no-car transit trips
	if (!searchParams.debut) {
		if (searchParams.planification !== 'oui') {
			setTimeout(() => {
				setSearchParams({ planification: 'oui', auto: 'oui' })
			}, 3000)

			return {
				state: 'loading',
				message:
					'Aucun itinéraire "départ immédiat" trouvé. Passage en mode planification.',
			}
		} else {
			const bikePortionDistance = 0.5 * 20 // 20 km/h * 1/2 h

			if (distance < bikePortionDistance)
				return {
					state: 'error',
					reason: `Pas de transport en commun trouvé qui soit plus rapide que 30 min directement à vélo.`,
				}

			setTimeout(() => {
				setSearchParams({
					debut: 'vélo-15min',
					fin: 'vélo-15min',
					auto: 'oui',
				})
			}, 3000)
			return {
				state: 'loading',
				message:
					'Aucun itinéraire porte à porte trouvé. Élargissement avec 15 minutes de vélo.',
			}
		}
	}
	if (searchParams.auto) {
		if (searchParams.debut === 'vélo-15min') {
			const bikePortionDistance = 1 * 20 // 20 km/h * 1 h

			if (distance < bikePortionDistance)
				return {
					state: 'error',
					reason: `Pas de transport en commun trouvé qui soit plus rapide qu'1h directement à vélo.`,
				}

			setTimeout(() => {
				setSearchParams({
					debut: 'vélo-30min',
					fin: 'vélo-30min',
				})
			}, 3000)

			return {
				state: 'loading',
				message:
					'Aucun itinéraire à 15 minutes de vélo trouvé. Élargissement avec 30 minutes de vélo.',
			}
		}

		const bikePortionDistance = 2 * 20 // 20 km/h * 2 h

		if (distance < bikePortionDistance)
			return {
				state: 'error',
				reason: `Pas de transport en commun trouvé qui soit plus rapide que 2h directement à vélo.`,
			}

		setTimeout(() => {
			setSearchParams({
				debut: 'vélo-60min',
				fin: 'vélo-60min',
			})
		}, 3000)

		return {
			state: 'loading',
			message:
				'Aucun itinéraire à 30 minutes de vélo trouvé. Élargissement final à 1h de vélo.',
		}
	}

	/*
	 *
				return {
					state: 'error',
					reason: 'Pas de transport en commun trouvé :/',
				}
				*/
}
