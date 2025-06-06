import { computeDistanceAndSpeed } from '@/components/transit/smartItinerary'

export default function SlowTransit({ data, itineraryDistance }) {
	const has = data.itineraries?.length > 0,
		[, speed] = computeDistanceAndSpeed(data, itineraryDistance),
		hasQuickEnough = has && speed > 9 //TODO To adjust

	if (hasQuickEnough) return null

	const text =
		speed < 5 ? "plus lent qu'une marche" : "à peine plus rapide qu'une marche"
	// We don't compare transit to cycling, it would loose in 90 % of cases in
	// cities. Bus are slow in our car-crowded cities
	//: "plus lent qu'à vélo"

	return (
		<div style={{ paddingLeft: '.6rem' }}>
			<small>🐢 Le meilleur trajet est {text} !</small>
		</div>
	)
}
