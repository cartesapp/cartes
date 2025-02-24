import Sommaire from '../blog/Sommaire'
import Intro from './intro.mdx'
import Basemaps from './basemaps.mdx'
import Interface from './interface.mdx'
import Contribution from './contribution.mdx'
import NextSteps from '@/components/NextSteps'
import { capitalise0 } from '@/components/utils/utils'
import Itinerary from './itinerary.mdx'
import Divers from './divers.mdx'
import PlaceSearch from './placeSearch.mdx'
import StreetImagery from './street.mdx'

export default function Content() {
	return (
		<section>
			<Sommaire
				url={'/roadmap'}
				headings={[
					'introduction',
					'basemaps',
					'interface',
					['itineraries', 'Itineraries'],
					'contribution',
				].map((el0) => {
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
			<NextSteps
				issues={[
					830, 699,
					// fonds de carte plus à jour
				]}
			/>
			<Interface />
			<NextSteps issues="574" />
			<PlaceSearch />
			<NextSteps issues={[565]} />
			<StreetImagery />
			<Itinerary />
			<NextSteps issues={[834, 261]} />
			<Contribution />
			<NextSteps issues={[580, 767]} />
			<Divers />
			<NextSteps issues={[546]} />
		</section>
	)
}
