import Image from 'next/image'
import itineraryIcon from '@/public/itinerary-circle-plain.svg'
import { useMediaQuery } from 'usehooks-ts'
import { styled } from 'next-yak'

export default function ClickItineraryInstruction({ state }) {
	const stepKeys = state?.map((step) => step != null && step.key),
		validSteps = stepKeys.filter(Boolean),
		stepsCount = validSteps.length

	console.log('cyan steps', state)

	const isMobile = useMediaQuery('(max-width: 800px)')
	const actionIcon = isMobile ? '👆️' : '🖱️'
	return (
		<Wrapper>
			<Image
				src={itineraryIcon}
				alt="Icone flèche représentant le mode itinéraire"
			/>
			{stepsCount === 0 ? (
				<p>
					Saisissez vos étapes ci-dessus, <br />
					ou {actionIcon} choisissez départ et arrivée sur la carte.
				</p>
			) : state.length === 2 && !stepKeys[0] ? (
				<p>
					Saisissez votre départ, <br />
					ou {actionIcon} choisissez-le sur la carte.
				</p>
			) : stepsCount === 1 ? (
				<p>
					Saisissez votre destination, <br />
					ou {actionIcon} choisissez-la sur la carte.
				</p>
			) : null}
		</Wrapper>
	)
}

const Wrapper = styled.div`
	margin: 1rem 0;
	text-align: center;
	img {
		width: 1.2rem;
		height: auto;
		margin-right: 0.6rem;
	}
`
