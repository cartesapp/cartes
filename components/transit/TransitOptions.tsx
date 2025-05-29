import useSetSearchParams from '@/components/useSetSearchParams'
import correspondanceIcon from '@/public/correspondance.svg'
import tortoiseIcon from '@/public/tortoise.svg'
import Image from 'next/image'

import StartEndOptions from './StartEndOptions'
import { Button } from './UI'
import { StepIcon } from '@/app/itinerary/Steps'
import {
	Correspondances,
	Infinite,
	NotInfinite,
	Section,
	TortoiseImage,
} from './TransitOptionsUI'

export default function TransitOptions({ searchParams }) {
	const { correspondances, tortue } = searchParams
	// marche-10min
	// vélo-45min
	const setSearchParams = useSetSearchParams()

	return (
		<Section>
			<ol>
				<StepIcon>A</StepIcon>

				<StartEndOptions
					{...{ partKey: 'debut', searchParams, setSearchParams }}
				/>
				<Button
					style={{
						cursor: 'pointer',
						position: 'relative',
					}}
					onClick={() =>
						setSearchParams({
							correspondances:
								correspondances == null
									? 0
									: +correspondances >= 2
									? undefined
									: +correspondances + 1,
						})
					}
				>
					<Image
						src={correspondanceIcon}
						alt="Icône de correspondance de transport en commun"
						style={{
							width: '2.3rem',
						}}
					/>
					<Correspondances>
						{correspondances == 0 ? (
							'direct'
						) : (
							<div>
								<div>
									{correspondances == null ? (
										<Infinite>∞</Infinite>
									) : (
										<NotInfinite>{+correspondances + 1} max</NotInfinite>
									)}
								</div>
								{false && <small>corresp.</small>}
							</div>
						)}
					</Correspondances>
				</Button>
				<TortoiseImage
					$tortue={tortue}
					src={tortoiseIcon}
					alt="Icône d'une tortue symbolisant une correspondance moins rapide"
					onClick={() => setSearchParams({ tortue: tortue ? undefined : 3 })}
					title="Multiplier par 3 le temps de correspondance"
				/>
				<StartEndOptions
					{...{ partKey: 'fin', searchParams, setSearchParams }}
				/>
				<StepIcon>B</StepIcon>
			</ol>
		</Section>
	)
}
