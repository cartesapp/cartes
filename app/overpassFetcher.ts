import { overpassFetchOptions, overpassRequestSuffixs } from './osmRequest';

/**
 * Tente de récupérer des données depuis plusieurs URLs Overpass jusqu'à ce qu'une requête réussisse
 * @param urlPath La partie de l'URL après le préfixe Overpass
 * @returns Les données JSON de la première requête réussie ou une erreur si toutes échouent
 */
export async function resilientOverpassFetch(urlPath: string) {
  // Stocke la dernière erreur pour la renvoyer si toutes les tentatives échouent
  let lastError: Error | null = null;

  // Essaie chaque suffixe d'URL Overpass dans l'ordre
  for (const suffix of overpassRequestSuffixs) {
    const fullUrl = `${suffix}${urlPath}`;
    
    try {
      const response = await fetch(fullUrl, overpassFetchOptions);
      
      if (!response.ok) {
        // Si la réponse n'est pas OK, on continue avec le prochain suffixe
        console.warn(`Échec de la requête Overpass vers ${suffix} (${response.status}), essai du serveur suivant...`);
        continue;
      }
      
      // Tente de parser la réponse JSON
      const data = await response.json();
      
      // Si on arrive ici, la requête a réussi, on retourne les données
      console.log(`Requête Overpass réussie via ${suffix}`);
      return data;
    } catch (error) {
      // Stocke l'erreur et continue avec le prochain suffixe
      console.warn(`Erreur lors de la requête Overpass vers ${suffix}:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // Si on arrive ici, toutes les tentatives ont échoué
  throw lastError || new Error('Toutes les requêtes Overpass ont échoué');
}
