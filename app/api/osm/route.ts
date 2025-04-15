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
            n.id as id,
            n.tags AS tags,
            json_build_object(
              'created', n.created,
              'version', n.version,
              'changeset_id', n.changeset_id,
              'user_id', n.user_id,
              'user', u.name) AS metadata,
            ST_AsGeoJSON(g.geom) as geometry,
            NULL::real AS area,
          FROM planet_osm_nodes as n
            LEFT JOIN planet_osm_users AS u ON n.user_id = u.id
            LEFT JOIN nodes_geom AS g ON n.id = g.id
          WHERE n.id =  $1
        `,
				params: [osmId],
			}
		case 'way':
			return {
				query: `
          SELECT
            w.id as id,
            w.tags AS tags,
            json_build_object(
              'created', w.created,
              'version', w.version,
              'changeset_id', w.changeset_id,
              'user_id', w.user_id,
              'user', u.name) AS metadata,
            ST_AsGeoJSON(g.geom) as geometry,
            g.area as area
          FROM planet_osm_ways as w
            LEFT JOIN planet_osm_users AS u ON w.user_id = u.id
            LEFT JOIN ways_geom AS g ON w.id = g.id
          WHERE w.id =  $1
        `,
				params: [osmId],
			}
		case 'relation':
			return {
				query: `
          SELECT
            r.id as id,
            r.tags AS tags,
            json_build_object(
              'created', r.created,
              'version', r.version,
              'changeset_id', r.changeset_id,
              'user_id', r.user_id,
              'user', u.name) AS metadata,
            ST_AsGeoJSON(g.geom) as geometry,
            g.area as area
          FROM planet_osm_rels as r
            LEFT JOIN planet_osm_users AS u ON r.user_id = u.id
            LEFT JOIN rels_geom AS g ON r.id = g.id
          WHERE r.id =  $1
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

		// on vérifie qu'il y a bien un type et un id dans la requête
		if (!featureType || !osmId) {
			return NextResponse.json(
				{ error: 'Les paramètres featureType et osmId sont requis' },
				{ status: 400 }
			)
		}

		// on vérifie que le type est le bon
		if (!['node', 'way', 'relation'].includes(featureType)) {
			return NextResponse.json(
				{ error: 'featureType doit être node, way ou relation' },
				{ status: 400 }
			)
		}

		const { query, params } = getQuery(featureType, osmId)
		console.time('poolconnect')
		const client = await pool.connect()
		console.timeLog('poolconnect')

		try {
			const result = await client.query(query, params)

			if (result.rows.length === 0) {
				return NextResponse.json(
					{ error: `No ${featureType} found with OSM id ${osmId}` },
					{ status: 404 }
				)
			}
			if (result.rows.length > 1) {
				return NextResponse.json(
					{
						error: `Multiple ${featureType} found with OSM id ${osmId}. This is a problem, it shouldn't happen !`,
					},
					{ status: 500 }
				)
			}

			const row = result.rows[0]
			let geometry = JSON.parse(row.geometry)

			// Traiter les tags selon leur type
			let tags = row.tags
			try {
				if (tags) {
					// Nettoyer les tags si nécessaire
					Object.keys(tags).forEach((key) => {
						// Supprimer les guillemets ou caractères spéciaux indésirables
						if (typeof tags[key] === 'string') {
							tags[key] = tags[key].replace(/^['">]+|['">]+$/g, '')
						}
					})
				}
			} catch (error) {
				console.error('Erreur lors du parsing des tags:', error, row.tags)
			}

			// Préparer les propriétés
			const properties = {
				featureType,
				osm_id: row.id,
				area: row.area,
				tags: tags,
				metadata: row.metadata,
			}

			// Si c'est un point, ajouter lat/lon directement dans les propriétés
			if (geometry.type === 'Point') {
				properties.lat = geometry.coordinates[1] // Latitude
				properties.lon = geometry.coordinates[0] // Longitude
			}

			const feature = {
				type: 'Feature',
				id: row.id,
				properties,
				geometry,
			}

			return NextResponse.json(feature)
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
