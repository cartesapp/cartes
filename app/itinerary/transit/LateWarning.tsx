import { stamp } from '@/app/itinerary/transit/utils'
import { styled } from 'next-yak'

export const LateWarning = ({ date, firstDate }) => {
	const diffHours = (stamp(firstDate) - stamp(date)) / (60 * 60)

	const displayDiff = Math.round(diffHours)
	if (diffHours > 12)
		return <p>😓 Le prochain trajet part plus de {displayDiff} heures après.</p>
	if (diffHours > 4)
		return (
			<P> 😔 Le prochain trajet part plus de {displayDiff} heures après.</P>
		)
	if (diffHours > 2)
		return (
			<P> ⏳ Le prochain trajet part plus de {displayDiff} heures après.</P>
		)
	if (diffHours > 1)
		return <P> ⏳ Le prochain trajet part plus d'une heure après.</P>
	return null
}

const P = styled.p`
	text-align: right;
`
