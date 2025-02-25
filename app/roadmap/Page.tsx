import Logo from '@/public/logo.svg'
import Image from 'next/image'
import CTA from './CTA'
import { PresentationWrapper } from '@/app/integration/UI.tsx'
import Content from './Content'

export const title = 'Building an open source european Maps'
export const description = `
  One year ago, we started building an open source alternative to Google and Apple Maps. What does it take to do that ? How far have we gone ? What's next ?
`

export default function Page() {
	return (
		<PresentationWrapper style={{ maxWidth: '900px' }}>
			<section>
				<header>
					<h1>
						<Image src={Logo} alt="Logo de cartes.app" /> <span>Cartes</span>
					</h1>
				</header>
			</section>
			<Image
				src={'/blog-images/construction.jpg'}
				width="400"
				height="400"
				style={{
					width: '400px',
					height: 'auto',
					margin: '0 auto',
					display: 'block',
					borderRadius: '1rem',
					boxShadow:
						'.3px .5px .7px #a1a1a15c,.8px 1.6px 2px -.8px #a1a1a15c,2.1px 4.1px 5.2px -1.7px #a1a1a15c,5px 10px 12.6px -2.5px #a1a1a15c',
				}}
				alt="Image of the map of France being built as a building worksite"
			/>
			<h2>{title}</h2>
			<p>{description}</p>
			<Content />
			<CTA>Tester Cartes</CTA>
		</PresentationWrapper>
	)
}
