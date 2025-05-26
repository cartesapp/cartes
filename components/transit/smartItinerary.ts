import { computeMotisTrip } from '@/app/itinerary/transit/motisRequest'

export function unsatisfyingItineraries(json, itineraryDistance) {
	if (!json.itineraries.length) return true

	//TODO we could use here more sophisticated algorithms to solve the frequent
	//problem of buses that make detours just to take a train. It's easy if the
	//detour is replacable by the bike max time set in useFetchItinerary, but it
	//would fail by just one minute ! We'd have to analyse the shape of the
	//transit.
}

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
			const bikePrePostDistance = 0.5 * 20 // 20 km/h * 1/2 h

			if (distance < bikePrePostDistance)
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
			const bikePrePostDistance = 1 * 20 // 20 km/h * 1 h

			if (distance < bikePrePostDistance)
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

		const bikePrePostDistance = 2 * 20 // 20 km/h * 2 h

		if (distance < bikePrePostDistance)
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
