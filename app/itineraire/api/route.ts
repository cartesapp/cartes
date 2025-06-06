import splitAllez from '@/components/itinerary/splitAllez'
import {
	computeMotisTrip,
	isNotTransitItinerary,
} from '@/app/itinerary/transit/motisRequest'
import { initialDate } from '@/app/itinerary/transit/utils'
import { stepOsmRequest } from '@/app/stepOsmRequest'

/* This little API is used by cava.cartes.app's uptime robots */
export async function GET(request: { url: string | URL }) {
	const requestUrl = new URL(request.url),
		allez = requestUrl.searchParams.get('allez')
	const split = splitAllez(allez)

	const promises = split.map((point) => stepOsmRequest(point))
	const state = await Promise.all(promises)

	const date = initialDate()
	try {
		const start = state[0],
			destination = state[1]

		const [lng, lat] = start.center.geometry.coordinates
		const [lngB, latB] = destination.center.geometry.coordinates

		const json = await computeMotisTrip(
			{ lng, lat },
			{ lng: lngB, lat: latB },
			date
		)

		if (json.state === 'error' || !json.itineraries) {
			console.log(json)
			return new Response(`Motis error`, { status: 500 })
		}
		const { itineraries } = json
		const transitItineraries = itineraries.filter(
			(connection) => !isNotTransitItinerary(connection)
		)

		if (!transitItineraries.length) {
			return new Response(
				`Itinerary API call error : no transit itinerary available at this date`,
				{
					status: 404,
				}
			)
		}
		return Response.json(json)
	} catch (error) {
		return new Response(`Itinerary API call error: ${error.message}`, {
			status: 400,
		})
	}
}
