import { Metadata } from 'next'
import { description } from '../layout'
import { PresentationWrapper } from '../presentation/UI'
import Trouver from './Trouver'

const title = "Trouver l'adresse d'une annonce immo"
const description =
	"En 2 secondes, trouver l'adresse d'une annonce immobilière et obtenir des informations précises sur le logement, appartement en copropriété ou maison."

export const metadata: Metadata = {
	title,
	description,
}

export default async function (props) {
	const searchParams = await props.searchParams
	return (
		<PresentationWrapper>
			<section>
				<header>
					<h1>{title}</h1>
				</header>
			</section>

			<p>{description}</p>
			<Trouver searchParams={searchParams} />
		</PresentationWrapper>
	)
}

// https://jhildenbiddle.github.io/css-device-frames/#/
