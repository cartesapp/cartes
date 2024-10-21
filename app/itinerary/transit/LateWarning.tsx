import { stamp } from '@/app/itinerary/transit/utils'

export const LateWarning = ({ date, firstDate }) => {
	const diffHours = (firstDate - stamp(date)) / (60 * 60)

	const displayDiff = Math.round(diffHours)
	if (diffHours > 12)
		return <p>😓 Le prochain trajet part plus de {displayDiff} heures après.</p>
	if (diffHours > 4)
		return (
			<p> 😔 Le prochain trajet part plus de {displayDiff} heures après.</p>
		)
	if (diffHours > 2)
		return (
			<p> ⏳ Le prochain trajet part plus de {displayDiff} heures après.</p>
		)
	if (diffHours > 1)
		return <p> ⏳ Le prochain trajet part plus d'une heure après.</p>
	return null
}
