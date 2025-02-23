import Sommaire from '../blog/Sommaire'
import Intro from './intro.mdx'
import Basemaps from './basemaps.mdx'
import Interface from './interface.mdx'
import Contribution from './contribution.mdx'
import Navigation from './navigation.mdx'
import NextSteps from '@/components/NextSteps'
import { capitalise0 } from '@/components/utils/utils'

export default function Content() {
	return (
		<section>
			<Sommaire
				url={'/roadmap'}
				headings={['introduction', 'basemaps', 'interface'].map((el0) => {
					const el = Array.isArray(el0) ? el0 : [el0, capitalise0(el0)]
					return {
						slug: el[0],
						text: el[1],
						level: 2,
					}
				})}
			/>
			<Intro />
			<Basemaps />
			<NextSteps issues={['free satellite imager', 'paid styles']} />
			<Interface />
			<NextSteps issues="574" />
			<Navigation />
			<Contribution />
			<NextSteps issues="580" />
		</section>
	)
}
