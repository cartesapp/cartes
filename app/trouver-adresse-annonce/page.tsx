import { Metadata } from 'next'
import { description } from '../layout'
import Image from 'next/image'
import Logo from '@/public/logo.svg'
import { PresentationWrapper } from '../presentation/UI'
import Trouver from './Trouver'

const title = "Trouver l'adresse d'une annonce immo"
const description =
	"En 2 secondes, trouver l'adresse d'une annonce immobilière et obtenir des informations précises sur le logement, appartement en copropriété ou maison."

export const metadata: Metadata = {
	title,
	description,
}

export default function () {
	return (
		<PresentationWrapper>
			<section>
				<header>
					<h1>
						<Image src={Logo} alt="Logo de cartes.app" /> Cartes Immo
					</h1>
				</header>
			</section>
			<h2>{title}</h2>
			<p>{description}</p>
			<Trouver />
		</PresentationWrapper>
	)
}

// https://jhildenbiddle.github.io/css-device-frames/#/
