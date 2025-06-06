import { computeDistanceAndSpeed } from '@/components/transit/smartItinerary'

export default function SlowTransit({ data, itineraryDistance }) {
	const has = data.itineraries?.length > 0,
		[distance, speed] = computeDistanceAndSpeed(data, itineraryDistance),
		hasQuickEnough = has && speed > 6 //TODO To adjust

	if (distance > 10) return null // in some cases a bus could be way slower but walking but walking would be in 99 % of cases an idea that no one would have. 10 km = 2 hours of walk

	if (hasQuickEnough) return null

	const text =
		speed < 3
			? "bien plus lent qu'une marche"
			: speed < 4.5
			? "plus lent qu'une marche"
			: "à peine plus rapide qu'une marche"
	// We don't compare transit to cycling, it would loose in 90 % of cases in
	// cities. Bus are slow in our car-crowded cities
	//: "plus lent qu'à vélo"

	return (
		<div style={{ paddingLeft: '.6rem' }}>
			<small>🐢 Le meilleur trajet est {text} !</small>
		</div>
	)
}
