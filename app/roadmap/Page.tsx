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
						<Image src={Logo} alt="Logo de cartes.app" /> Cartes
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
