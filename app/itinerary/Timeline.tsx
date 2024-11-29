import useSetSearchParams from '@/components/useSetSearchParams'
import Link from 'next/link'
import TransitSummary from './transit/TransitSummary'
import { nowStamp } from './transit/utils'
import { css } from 'next-yak'
import { Line } from './transit/Line'

export default function Timeline({ itinerary }) {
	console.log('lightgreen timeline', itinerary)
	const setSearchParams = useSetSearchParams()
	const cyclingSeconds =
		itinerary.routes.cycling?.features &&
		+itinerary.routes.cycling.features[0].properties['total-time']
	const walkingSeconds =
		itinerary.routes.walking?.features &&
		+itinerary.routes.walking.features[0].properties['total-time']
	const max = Math.max(...[cyclingSeconds, walkingSeconds].filter(Boolean))
	const now = nowStamp()
	const connectionsTimeRange = {
		from: now,
		to: now + max,
	}
	return (
		<ol
			css={css`
				margin-top: 1rem;
				li {
				}
				a {
					color: inherit;
					text-decoration: none;
				}
			`}
		>
			{itinerary.routes.cycling?.features && (
				<Link href={setSearchParams({ mode: 'velo' }, true)}>
					<Line
						{...{
							connectionsTimeRange,
							connection: { seconds: cyclingSeconds },
							connectionRange: [now, now + cyclingSeconds],
							transports: [
								{
									seconds: cyclingSeconds,
									route_color: '#8f53c1',
									route_text_color: 'white',
									shortName: 'Vélo',
									move_type: 'Cycle',
								},
							],
						}}
					/>
				</Link>
			)}
			{itinerary.routes.walking?.features && (
				<Link href={setSearchParams({ mode: 'marche' }, true)}>
					<Line
						{...{
							connectionsTimeRange,
							connection: { seconds: walkingSeconds },
							connectionRange: [now, now + walkingSeconds],
							transports: [
								{
									seconds: walkingSeconds,
									route_color: '#ddb4ff',
									route_text_color: 'white',
									shortName: 'Marche',
									move_type: 'Walk',
								},
							],
						}}
					/>
				</Link>
			)}

			<Link href={setSearchParams({ mode: 'commun' }, true)}>
				<TransitSummary itinerary={itinerary} />
			</Link>
		</ol>
	)
}
