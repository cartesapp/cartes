import carIcon from '@/public/car.svg'
import { getTimePart } from '@/components/transit/modes'
import { ModeHr, ModeImage, ModeTimeButton } from './TransitOptionsUI'
import { Button } from './UI'

export default function StartEndOptions({
	setSearchParams,
	searchParams,
	partKey,
}) {
	const which = searchParams[partKey]
	const time = which && getTimePart(which)

	return (
		<Button
			style={{
				flexDirection: 'row',
				width: '6rem',
			}}
		>
			<ModeHr />

			<button
				onClick={() =>
					setSearchParams({
						[partKey]: which?.startsWith('voiture')
							? undefined
							: (which
									? which.startsWith('marche-')
										? 'vélo'
										: which.startsWith('vélo')
										? 'voiture'
										: /* TODO activate this when we can draw precise walk trips, else we can't easily check that wheelchair routing works.
									: which.startsWith('voiture')
									? 'marchereduite'
									*/
										  'marche'
									: 'marche') +
							  '-' +
							  (!which ? '5min' : getTimePart(which) + 'min'),
					})
				}
			>
				{which == null ? (
					<ModeImage
						src={'/walk-or-cycle.svg'}
						alt="Icône de quelqu'un qui marche ou roule à vélo"
						width="10"
						height="10"
					/>
				) : which.startsWith('marchereduite') ? (
					<ModeImage
						src={'/wheelchair.svg'}
						alt="Icône d'une personne en fauteuil roulant"
						width="10"
						height="10"
					/>
				) : which.startsWith('marche') ? (
					<ModeImage
						src={'/walking.svg'}
						alt="Icône de quelqu'un qui marche"
						width="10"
						height="10"
					/>
				) : which.startsWith('voiture') ? (
					<ModeImage src={carIcon} alt="Icône d'une voiture" />
				) : which.startsWith('vélo') ? (
					<ModeImage
						src={'/cycling.svg'}
						alt="Icône d'un vélo"
						width="10"
						height="10"
					/>
				) : (
					<span>quoi ?</span>
				)}
			</button>
			<ModeTimeButton
				onClick={() =>
					setSearchParams({
						[partKey]:
							(which ? which.split('-')[0] : 'marche') +
							'-' +
							(!time
								? '5min'
								: time == 5
								? '15min'
								: time == 15
								? '30min'
								: '5min'),
					})
				}
			>
				<span></span>
				<div>
					{time == null ? (
						<span
							style={{
								fontSize: '70%',
							}}
						>
							auto
						</span>
					) : (
						<div>
							<div>{time}'</div>
						</div>
					)}
				</div>
			</ModeTimeButton>
		</Button>
	)
}
