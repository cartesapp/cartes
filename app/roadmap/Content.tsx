import NextSteps from '@/components/NextSteps'
import { capitalise0 } from '@/components/utils/utils'
import { styled } from 'next-yak'
import Sommaire from '../blog/Sommaire'
import Basemaps, { todo as basemapsIssues } from './basemaps.mdx'
import Contribution, { todo as contributionIssues } from './contribution.mdx'
import Divers, { todo as diversIssues } from './divers.mdx'
import I18n, { todo as i18nIssues } from './i18n.mdx'
import Interface, { todo as interfaceIssues } from './interface.mdx'
import Intro from './intro.mdx'
import Itinerary, { todo as itineraryIssues } from './itinerary.mdx'
import PlaceSearch, { todo as placeSearchIssues } from './placeSearch.mdx'
import StreetImagery, { todo as streetImageryIssues } from './street.mdx'

export default function Content() {
	return (
		<Section>
			<Sommaire
				url={'/roadmap'}
				headings={[
					'introduction',
					'basemaps',
					'interface',
					'internationalisation',
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
			<NextSteps issues={basemapsIssues} />
			<Interface />
			<NextSteps issues={interfaceIssues} />
			<I18n />
			<NextSteps issues={i18nIssues} />
			<PlaceSearch />
			<NextSteps issues={placeSearchIssues} />
			<StreetImagery />
			<Itinerary />
			<NextSteps issues={itineraryIssues} />
			<Contribution />
			<NextSteps issues={contributionIssues} />
			<Divers />
			<NextSteps issues={diversIssues} />
		</Section>
	)
}

/*
const Total = () => {
	const total = [
		interfaceIssues,
		i18nIssues,
		placeSearchIssues,
		itineraryIssues,
		contributionIssues,
		diversIssues,
	]
		.flat()
		.reduce((memo, next) => {}, 0)
}
*/

const Section = styled.section``
