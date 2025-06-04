import { Metadata } from 'next'
import { description } from '../layout'
import { title } from './Page'
import { PresentationWrapper } from './UI'
import Image from 'next/image'
import Logo from '@/public/logo.svg'

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
						<Image src={Logo} alt="Logo de cartes.app" /> Cartes
					</h1>
				</header>
			</section>
			<h2>Intégrez une carte à votre site en 30 secondes</h2>

			<p>
				Vous êtes un club sportif, une association, un commerce, une
				administration avec des locaux ouverts au public ? Il est important de
				montrer une carte à vos utilisateurs.{' '}
			</p>
		</PresentationWrapper>
	)
}

// https://jhildenbiddle.github.io/css-device-frames/#/
