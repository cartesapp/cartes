import Image from 'next/image'
import { StyleElementChooserWrapper } from './PanoramaxChooser'
import distanceIcon from '@/public/distance.svg'

export default function TerraDrawButton({ searchParams, setSearchParams }) {
	const checked = searchParams.dessin === 'oui'
	return (
		<StyleElementChooserWrapper>
			<label title="Afficher sur la carte les photos de rue Panoramax disponibles">
				<input
					type="checkbox"
					checked={checked}
					onChange={() => {
						if (searchParams.dessin === 'oui')
							setSearchParams({ dessin: undefined })
						else {
							setSearchParams({ dessin: 'oui' })
						}
					}}
				/>
				<span>
					<Image
						src={checked ? distanceIcon : distanceIcon}
						alt="Icône d'une règle pour mesurer des distances et tracer des formes"
					/>
					Dessin
				</span>
			</label>
		</StyleElementChooserWrapper>
	)
}
