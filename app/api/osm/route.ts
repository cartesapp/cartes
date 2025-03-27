import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Configuration de la connexion PostgreSQL
const pool = new Pool({
	host: '51.159.100.169',
	user: 'readonlyuser',
	database: 'osm',
	ssl: false,
	password: 'iwanttoreadfree',
})

// Fonction pour parser manuellement le format HSTORE
function parseHstore(value: string): Record<string, string> {
	if (!value) return {}

	// Si c'est déjà un objet, le retourner directement
	if (typeof value === 'object') return value;

	const result: Record<string, string> = {}
	
	// Format PostgreSQL HSTORE: "key"=>"value", "key2"=>"value2"
	// On utilise une regex plus simple et plus robuste
	const regex = /"([^"]+)"=>"([^"]*)"(?:,|$)/g;
	
	let match;
	while ((match = regex.exec(value)) !== null) {
		if (match[1]) {
			result[match[1]] = match[2] || '';
		}
	}

	return result;
}

// Fonction pour obtenir la requête SQL en fonction du type de feature et de l'ID
function getQuery(
	featureType: string,
	osmId: number
): { query: string; params: any[] } {
	switch (featureType) {
		case 'node':
			return {
				query: `
          SELECT
            osm_id,
            tags,
            ST_AsGeoJSON(way) as geometry
          FROM
            planet_osm_point
          WHERE
            osm_id = $1
        `,
				params: [osmId],
			}
		case 'way':
			return {
				query: `
          SELECT
            osm_id,
            tags,
            ST_AsGeoJSON(way) as geometry
          FROM
            planet_osm_line
          WHERE
            osm_id = $1
          UNION
          SELECT
            osm_id,
            tags,
            ST_AsGeoJSON(way) as geometry
          FROM
            planet_osm_polygon
          WHERE
            osm_id = $1
        `,
				params: [osmId],
			}
		case 'relation':
			return {
				query: `
          SELECT
            osm_id,
            tags,
            ST_AsGeoJSON(way) as geometry
          FROM
            planet_osm_polygon
          WHERE
            osm_id = -$1
        `,
				params: [osmId],
			}
		default:
			throw new Error(`Type de feature non supporté: ${featureType}`)
	}
}

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const featureType = searchParams.get('featureType')
		const osmId = parseInt(searchParams.get('osmId') || '0')

		if (!featureType || !osmId) {
			return NextResponse.json(
				{ error: 'Les paramètres featureType et osmId sont requis' },
				{ status: 400 }
			)
		}

		if (!['node', 'way', 'relation'].includes(featureType)) {
			return NextResponse.json(
				{ error: 'featureType doit être node, way ou relation' },
				{ status: 400 }
			)
		}

		const { query, params } = getQuery(featureType, osmId)
		const client = await pool.connect()

		try {
			const result = await client.query(query, params)

			if (result.rows.length === 0) {
				return NextResponse.json(
					{ error: `Aucun ${featureType} trouvé avec l'ID ${osmId}` },
					{ status: 404 }
				)
			}

			// Traitement des résultats
			const features = result.rows.map((row) => {
				const geometry = JSON.parse(row.geometry)
				// Traiter les tags selon leur type
				let tags = {}
				try {
					if (row.tags) {
						// Convertir les tags en objet
						tags = typeof row.tags === 'object' ? row.tags : parseHstore(row.tags)
						
						// Nettoyer les tags si nécessaire
						Object.keys(tags).forEach(key => {
							// Supprimer les guillemets ou caractères spéciaux indésirables
							if (typeof tags[key] === 'string') {
								tags[key] = tags[key].replace(/^['">]+|['">]+$/g, '');
							}
						});
					}
				} catch (error) {
					console.error('Erreur lors du parsing des tags:', error, row.tags)
				}

				return {
					type: 'Feature',
					id: row.osm_id,
					properties: {
						// Inclure les tags dans un objet "tags" comme attendu
						tags: tags,
						osm_id: row.osm_id,
						featureType,
					},
					geometry,
				}
			})

			return NextResponse.json({
				type: 'FeatureCollection',
				features,
			})
		} finally {
			client.release()
		}
	} catch (error) {
		console.error('Erreur lors de la récupération des données OSM:', error)
		return NextResponse.json(
			{ error: 'Erreur lors de la récupération des données' },
			{ status: 500 }
		)
	}
}
