import { isServer } from './serverUrls'

// Available Overpass API servers
const overpassRequestSuffixs = [
	'https://overpass.cartes.app/api/interpreter?data=',
	'https://overpass-api.de/api/interpreter?data=',
]

// and associated parameters
const overpassFetchOptions = isServer
	? {
			headers: {
				'User-Agent': 'Cartes.app',
			},
			next: { revalidate: 5 * 60 },
	  }
	: { cache: 'force-cache' }

/**
 * Fetch a request on each allowed server until success
 * @param query The Overpass query to fetch
 * @returns JSON data of the first successful request, or an error if they all fail
 */
export async function resilientOverpassFetch(
	query: string,
	options: object = {}
) {
	// Stocke la dernière erreur pour la renvoyer si toutes les tentatives échouent
	let lastError: Error | null = null

	// Essaie chaque suffixe d'URL Overpass dans l'ordre
	for (const suffix of overpassRequestSuffixs) {
		const fullUrl = `${suffix}${encodeURIComponent(query)}`

		try {
			const response = await fetch(fullUrl, {
				...overpassFetchOptions,
				...options,
			})

			if (!response.ok) {
				// Si la réponse n'est pas OK, on continue avec le prochain suffixe
				console.warn(
					`Échec de la requête Overpass vers ${suffix} (${response.status}), essai du serveur suivant...`
				)
				continue
			}

			// Tente de parser la réponse JSON
			const data = await response.json()

			// Si on arrive ici, la requête a réussi, on retourne les données
			//console.log(`Requête Overpass réussie via ${suffix}`)
			return data
		} catch (error) {
			// Stocke l'erreur et continue avec le prochain suffixe
			console.warn(`Erreur lors de la requête Overpass vers ${suffix}:`, error)
			lastError = error instanceof Error ? error : new Error(String(error))
		}
	}

	// Si on arrive ici, toutes les tentatives ont échoué
	throw lastError || new Error('Toutes les requêtes Overpass ont échoué')
}
