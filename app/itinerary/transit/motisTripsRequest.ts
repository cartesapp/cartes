import { motisServerUrl } from '@/app/serverUrls'

export const buildRequestBody = (trips) => {
	const tripIdObjects = trips.map((trip) => trip.id)
	const body = {
		destination: { type: 'Module', target: '/railviz/get_trips' },
		content_type: 'RailVizTripsRequest',
		content: {
			trips: tripIdObjects,
		},
	}
	return body
}

export const computeMotisTrips = async (trips) => {
	const body = buildRequestBody(trips)

	try {
		const request = await fetch(motisServerUrl, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		})
		if (!request.ok) {
			console.error('Error fetching motis server for trips method')
			return { state: 'error' }
		}
		const json = await request.json()
		console.log('motis trip', json)
		return json
	} catch (e) {
		// Can happen when no transit found, the server returns a timeout
		// e.g. for Rennes -> Port Navalo on a sunday...
		// Erratum : there was a problem on the server. Anyway, this error state is
		// useful
		console.error('Error fetching motis server for trips method', e)
		return { state: 'error' }
	}
}
