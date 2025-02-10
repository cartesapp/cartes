import { useEffect } from 'react'
import useUUID from './useUUID'
import { analyticsUrl } from '@/app/serverUrls'
import { time } from 'motion/dist/react'

export default function useTrackUser() {
	const uuid = useUUID()

	useEffect(() => {
		if (!uuid) return

		const doFetch = async () => {
			try {
				const traceUrl = `${analyticsUrl}/compte/${uuid}`
				const traceRequest = await fetch(traceUrl)
				const traceText = await traceRequest.text()
				console.log('Green analytics', traceText)
			} catch (e) {
				console.log('Erreur dans le sondage de paiement', e)
			}
		}
		//doFetch() analytics deactivated, we've successfully used Deno kv for this
		//but don't want to pay yet, since Umami does the job on our server

		const logMissingImages = async () => {
			if (typeof window === undefined || !window.missingImages) return

			try {
				const traceUrl = `${analyticsUrl}/mapImagesMissing`
				const traceRequest = await fetch(traceUrl, {
					method: 'POST',
					body: JSON.stringify(window.missingImages),
				})
				const result = await traceRequest.json()

				console.log('imagemissing added to DB')
				console.log(result)
			} catch (e) {
				console.log('Erreur dans le sondage sur les icônes manquantes', e)
			}
		}

		const timeoutFunction = () => logMissingImages()
		setTimeout(timeoutFunction, 10000)
		return timeoutFunction
	}, [uuid])
}

/*
 * Log missing icon events. Store event values a global variable that will be
 * send to our analytics server once in a while per user.
 * */
