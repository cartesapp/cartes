import useSetSearchParams from '@/components/useSetSearchParams'
import correspondanceIcon from '@/public/correspondance.svg'
import Image from 'next/image'

import StartEndOptions from './StartEndOptions'
import { Button } from './UI'
import { StepIcon } from '@/app/itinerary/Steps'

export default function TransitOptions({ searchParams }) {
	const { correspondances } = searchParams
	// marche-10min
	// vélo-45min
	const setSearchParams = useSetSearchParams()

	return (
		<section
			css={`
				margin: 0.8rem 0.4rem;
				img {
					width: 1.4rem;
					height: auto;
				}
				ol {
					list-style-type: none;
					display: flex;
					align-items: center;
				}
			`}
		>
			<ol>
				<StepIcon text={'A'} />

				<StartEndOptions {...{ key: 'debut', searchParams, setSearchParams }} />
				<Button
					css={`
						cursor: pointer;
						position: relative;
					`}
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
						css={`
							width: 2.6rem !important;
						`}
					/>
					<span
						css={`
							position: absolute;
							left: 50%;
							top: 50%;
							transform: translate(-50%, -50%);
							color: white;
							font-size: 70%;
							font-weight: bold;
						`}
					>
						{correspondances == 0 ? (
							'direct'
						) : (
							<div>
								<div>
									{correspondances == null ? (
										<div css="font-size: 140%; max-height: .8rem; line-height: .6rem">
											∞
										</div>
									) : (
										<span css="font-size: 100%; line-height: .8rem; white-space: nowrap">
											{+correspondances + 1} max
										</span>
									)}
								</div>
								{false && <small>corresp.</small>}
							</div>
						)}
					</span>
				</Button>
				<StartEndOptions {...{ key: 'fin', searchParams, setSearchParams }} />
				<StepIcon text={'B'} />
			</ol>
		</section>
	)
}