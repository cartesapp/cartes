import useSetSearchParams from '@/components/useSetSearchParams'
import { styled } from 'next-yak'
import Link from 'next/link'
import { Line } from './transit/Line'
import TransitSummary from './transit/TransitSummary'
import { nowStamp } from './transit/utils'

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
		<Ol>
			{itinerary.routes.cycling?.features && (
				<Link href={setSearchParams({ mode: 'velo' }, true)}>
					<Line
						{...{
							relativeWidth:
								cyclingSeconds / Math.max(cyclingSeconds, walkingSeconds),
							connectionsTimeRange,
							connection: { seconds: cyclingSeconds },
							connectionRange: [now, now + cyclingSeconds],
							transports: [
								{
									seconds: cyclingSeconds,
									routeColor: '#8f53c1',
									routeTextColor: 'white',
									mode: 'BIKE',
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
							relativeWidth:
								walkingSeconds / Math.max(cyclingSeconds, walkingSeconds),
							connectionsTimeRange,
							connection: { seconds: walkingSeconds },
							connectionRange: [now, now + walkingSeconds],
							transports: [
								{
									seconds: walkingSeconds,
									routeColor: '#ddb4ff',
									routeTextColor: 'white',
									mode: 'WALK',
								},
							],
						}}
					/>
				</Link>
			)}

			<Link href={setSearchParams({ mode: 'commun' }, true)}>
				<TransitSummary itinerary={itinerary} />
			</Link>
		</Ol>
	)
}

const Ol = styled.ol`
	margin-top: 1rem;
	li {
	}
	a {
		color: inherit;
		text-decoration: none;
	}
`
