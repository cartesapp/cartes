import { capitalise0 } from '@/components/utils/utils'
import { trainColors } from '@/app/itinerary/transit/motisRequest'
import { styled } from 'next-yak'

export const trainTypeSncfMapping = {
	tout: null,
	tgv: ['TGV', 'OUIGO', 'TGV INOUI', 'ICE', 'Lyria'],
	ter: ['TER', 'Train TER'],
	intercités: ['INTERCITES'],
	'train de nuit': ['INTERCITES de nuit'],
	car: ['Car TER', 'Car', 'Navette'],
}
export default function SncfSelect({ data, trainType, setTrainType }) {
	const safeTrainType = trainType || 'Tout'
	return (
		<Section>
			<form>
				{Object.entries(trainTypeSncfMapping).map(([key, list]) => {
					const background = list
						? trainColors[list[0]].color
						: 'var(--darkColor)'
					return (
						<Label key={key} $background={background}>
							<input
								type="radio"
								checked={key === safeTrainType}
								onClick={() => setTrainType(key)}
							/>
							{capitalise0(key)}
						</Label>
					)
				})}
			</form>
		</Section>
	)
}

const Section = styled.section`
	margin-top: 1rem;
	form {
		width: 100%;
		overflow: scroll;
		height: 2.4rem;
		label {
			margin: 0.6rem;
			white-space: nowrap;
		}
		input {
			margin-right: 0.4rem;
		}
	}
`

const Label = styled.label`
	background: ${(p) => p.$background};
	padding: 0 0.6rem 0.1rem 0.4rem;
	border-radius: 0.3rem;
	color: white;
`
