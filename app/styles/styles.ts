import cassini from './cassiniIgnStyle'
import cyclOsm from './cyclOsmStyle'
import elections from './elections'
import franceStyle from './france'
import natureStyle from './nature'
import railStyle from './railStyle'
import satellite from './satellite'
import testStreetComplete from './test-street-complete'
import voyageStyle from './voyage'
import carteFacile from 'carte-facile'

const key = process.env.NEXT_PUBLIC_MAPTILER

const maptilerUrl = (styleId) =>
	`https://api.maptiler.com/maps/${styleId}/style.json?key=${key}`

export const styles = {
	/* This style will replace the base MapTiler style, for cost reduction
	 * purposes (50 to 100 €/month in june !)
	 */
	france: {
		url: franceStyle(false),
		name: 'France',
		description: `Notre style maison, avec des bonus inédits : rail visible à haut niveau, arbres, et plein de futures nouveautés. Hébergé sur nos serveurs, contrairement aux autres il ne nous coûte rien. C'est le futur.`,
		attribution:
			'<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
	},
	'france-dark': {
		url: franceStyle(false, false, true),
		name: 'France (Nuit)',
		description: `Notre style maison en mode nuit, avec des bonus inédits : rail visible à haut niveau, arbres, et plein de futures nouveautés. Hébergé sur nos serveurs, contrairement aux autres il ne nous coûte rien. C'est le futur.`,
		attribution:
			'<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
		emoji: '🌙',
	},
	transports: {
		url: franceStyle(true),
		name: 'Transports',
		description: `Un style de carte dédié au transport pour afficher les plans urbains des réseaux de bus/tram/métro, mais aussi des cars et des trains nationaux.`,
		attribution:
			'<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
	},
	'transports-dark': {
		url: franceStyle(true, false, true),
		name: 'Transports (Nuit)',
		description: `Un style de carte dédié au transport en mode nuit pour afficher les plans urbains des réseaux de bus/tram/métro, mais aussi des cars et des trains nationaux.`,
		attribution:
			'<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
		emoji: '🌙',
	},
	/* The historical maptiler streets that we tuned for cartes.app */
	base: {
		url: voyageStyle(key),
		name: 'Monde',
		originalName: 'Voyage',
		description: `C'est l'ancienne version du style principal, qui reste meilleur pour un certain nombre d'aspects : noms des lieux étrangers en français, moins de bugs sur les côtes.`,
		emoji: '🗺️',
	},
	satellite: {
		url: satellite(key),
		name: 'Satellite',
		emoji: '🛰️',
	},
	satelliteHybrid: {
		url: maptilerUrl('hybrid'),
		title: 'satellite avec superposition des noms de lieux et rues',
		name: 'Hybride',
		originalName: 'Satellite Hybrid',
		emoji: '🛰️',
	},
	rando: {
		url: maptilerUrl('outdoor-v2'),
		name: 'Randonnée',
		subtitle: '(marche & vélo)',
		originalName: 'Outdoor',
		emoji: '🚶',
		hasTerrain: true,
	},
	ign: {
		url: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/standard.json',
		name: 'IGN',
		imageAlt: "Logo de l'IGN",
		attribution: '© IGN',
		group: 'ign',
	},
	'ign-simple': {
		url: carteFacile.mapStyle.simple,
		name: 'IGN simple',
		attribution: '© IGN',
		imageAlt: "Logo de l'IGN",
		inlineImage: carteFacile.mapThumbnails.simple.src,
		group: 'ign',
	},
	'ign-clair': {
		url: carteFacile.mapStyle.desaturated,
		name: 'IGN clair',
		attribution: '© IGN',
		imageAlt: "Logo de l'IGN",
		inlineImage: carteFacile.mapThumbnails.desaturated.src,
		group: 'ign',
	},
	osm: {
		url: maptilerUrl('openstreetmap'),
		name: 'OSM',
		originalName: 'OpenStreetMap',
	},
	nature: {
		url: natureStyle(key),
		name: 'Nature',
		emoji: '🏕️',
		hasTerrain: true,
	},
	cycling: { url: cyclOsm(key), name: 'Cyclable', emoji: '🚲️' },
	rail: {
		url: railStyle(key),
		name: 'Rails',
		emoji: '🛤️',
	},
	winter: {
		url: maptilerUrl('winter-v2'),
		name: 'Hiver',
		originalName: 'Winter',
		emoji: '⛄️',
		hasTerrain: true,
	},
	cassini: {
		url: cassini(key),
		name: 'Cassini',
		attribution:
			'<a href="https://www.ign.fr/institut/espace-presse/une-nouvelle-version-interactive-de-la-carte-de-cassini-sur-le-geoportail" target="_blank">IGN + BNF</a>',
		emoji: '🐎',
		secondary: true,
		artistic: true,
		description: 'Carte de Cassini, 18e siècle. Source IGN et BNF.',
	},
	'street-complete': {
		// Taken from MapTiler's dataviz style
		url: testStreetComplete,
		name: 'StreetComplete',
		emoji: '🧪',
		secondary: true,
	},
	elections: {
		url: elections(key),
		name: 'Élections',
		emoji: '🗳️',
		secondary: true,
		unlisted: true,
	},
}

export const styleExists = (styleKey) => styles[styleKey] != null
export const getStyle = (styleKey) => ({ ...styles[styleKey], key: styleKey })
export const homeMadeTerrainStyles = ['france', 'france-dark', 'satellite']
