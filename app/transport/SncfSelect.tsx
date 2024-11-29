 import { capitalise0 } from '@/components/utils/utils'
 import { trainColors } from '@/app/itinerary/transit/motisRequest'
 
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
 		<section
 			css={css`
 				margin-top: 1rem;
 			`}
 		>
 			<form
 				css={css`
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
 				`}
 			>
 				{Object.entries(trainTypeSncfMapping).map(([key, list]) => {
 					const background = list
 						? trainColors[list[0]].color
 						: 'var(--darkColor)'
 					return (
 						<label
 							key={key}
 							css={css`
 								background: ${background};
 								padding: 0 0.6rem 0.1rem 0.4rem;
 								border-radius: 0.3rem;
 								color: white;
 							`}
 						>
 							<input
 								type="radio"
 								checked={key === safeTrainType}
 								onClick={() => setTrainType(key)}
 							/>
 							{capitalise0(key)}
 						</label>
 					)
 				})}
 			</form>
 		</section>
 	)
 }
