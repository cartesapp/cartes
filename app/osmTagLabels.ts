import rawData from '@openstreetmap/id-tagging-schema/dist/translations/fr.json'

const { presets, fields } = rawData.fr.presets

export const getTagLabels = (key, value) => {
	const fullPreset = presets[key + '/' + value]
	if (fullPreset) return [fullPreset.name]

	const field = fields[key]

	if (!field) return [key, translateBasics(value)]

	const values = value.split(';'),
		translatedValues = values.map((v) => {
			const optionValue = field.options?.[v]
			switch (typeof optionValue) {
				case 'string':
					return optionValue
				case 'object':
					if (optionValue.title) return optionValue.title
					break
				default:
					return translateBasics(v)
			}
		})
	return [field.label, translatedValues.join(' - ')]
}

const translateBasics = (value: string) => {
	const found = { yes: 'oui', no: 'non' }[value]
	return found || value
}

// This is only a complement to the above imported set of translations.
// This list could someday be backported by whoever is motivated to make the contribution :)
export const tagNameCorrespondance = (key: string) => {
	const found = {
		alt_name: 'Autre nom',
		artist_name: "Nom de l'artiste",
		'award:accueilvelo': "Label Accueil Vélo",
		books: 'Livres',
		'brand:website': 'Site de la marque',
		'building:architecture': 'Style architectural',
		'building:levels': "Nombre d'étages",
		bulk_purchase: 'Achat en vrac',
		'cannabis:cbd': 'CBD',
		'capacity:disabled': 'Place de parking PMR',
		'check_date:opening_hours': 'Horaires vérifiés le',
		'check_date:wheelchair': 'Accès PMR vérifié le',
		'diet:dairy_free': 'Sans produits laitiers',
		'diet:gluten_free': 'Sans gluten',
		'diet:halal': 'Halal',
		'diet:kosher': 'Casher',
		'diet:lactose_free': 'Sans lactose',
		'diet:vegan': 'Végan',
		'diet:vegetarian': 'Végétarien',
		'drive_in': 'Ciné-parc',
		'emergency:phone': "Numéro d'urgence",
		female: 'Pour les femmes',
		'garden:style': 'Style de jardin',
		'happy_hours' : "Horaires de l'Happy Hour",
		indoor_seating: "Sièges à l'intérieur",
		'internet_access:fee': 'Accès Internet payant',
		male: 'Pour les hommes',
		'mhs:inscription_date': "Date d'inscription aux monuments historiques",
		official_name: 'Nom officiel',
		old_name: 'Ancien nom',
		'opening_hours:emergency': "Horaires en cas d'urgence",
		'opening_hours:signed': 'Horaires affichés',
		'operator:type': "Type d'opérateur",
		pastry: 'Patisserie',
		'payment:app': 'Paiement par application',
		'payment:card': 'Paiement par carte',
		'payment:cash': 'Paiement en liquide',
		'payment:cine_carte_cip': 'Carte CIP acceptée',
		'payment:cinepass': 'Cinépass accepté',
		'payment:contactless': 'Paiement sans contact',
		'payment:cb': 'Paiement par carte bancaire',
		'payment:credit_cards': 'Paiement par carte de crédit',
		'payment:debit_cards': 'Paiment par carte de débit',
		'payment:mastercard': 'Paiement par Mastercard',
		'payment:ugc_illimite': 'Pass UGC illimité accepté',
		'payment:visa': 'Paiement par Visa',
		'phone:mobile': 'N° de mobile',
		'reservation:website': 'Site web pour réservations',
		'service:bicycle:cleaning': 'Lavage de vélos',
		'service:bicycle:diy': "Atelier d'autoréparation de vélos",
		'service:bicycle:pump': 'Pompe à vélo en libre-service',
		'service:bicycle:rental': 'Location de vélos',
		'service:bicycle:repair': 'Réparation de vélos',
		'service:bicycle:retail': 'Vente de vélos',
		'service:bicycle:second_hand': "Vente de vélos d'occasion",
		short_name: 'Diminutif',
		tobacco: 'Vente de tabac',
		'toilets:wheelchair': 'Toilettes accessibles aux PMR',
		'toilets:access': 'Accès au toilettes',
		'website:menu': 'Menu',
		'wheelchair:description': "Description de l'accès PMR",
		'ref:INSEE': 'Code INSEE',
		'ref:FR:SIREN': 'Code SIREN',
		'ref:FR:NAF': 'Code NAF',
		'ref:FR:FANTOIR': 'Code FANTOIR',
		'ref:FR:FINESS': 'Code FINESS',
		passenger_information_display: "Ecran d'information voyageur",
		'survey:date': 'Dernière date de vérification',
		'species:fr': 'Espèce (fr)',
		'owner': 'Propriétaire',
		'bicycle': 'Vélo',
		'motor_vehicle': 'Véhicule à moteur',
		'motorcar': 'Voiture',
		'hgv': 'Camion',
		'charging_station:output': 'Puissance de la borne',
		'socket:type2': 'Nombre de prise type 2',
		'socket:type2:output': 'Puissance de la prise type 2',
		'socket:type2:current': 'Courant de la prise type 2',
		'socket:type2:voltage': 'Voltage de la prise type 2',
		'socket:type2_combo': 'Nombre de prise type 2 combo',
		'socket:type2_combo:output': 'Puissance de la prise type 2 combo',
		'socket:type2_combo:current': 'Courant de la prise type 2 combo',
		'socket:type2_combo:voltage': 'Voltage de la prise type 2 combo',
		'socket:chademo': 'Nombre de prise Chademo',
		'socket:chademo:output': 'Puissance de la prise Chademo',
		'socket:chademo:current': 'Courant de la prise Chademo',
		'socket:chademo:voltage': 'Voltage de la prise Chademo',
		'socket:typee': 'Nombre de prise domestique',
		'socket:typee:output': 'Puissance de la prise domestique',
		'socket:typee:current': 'Courant de la prise domestique',
		'socket:typee:voltage': 'Voltage de la prise domestique',
		'socket:type3c': 'Nombre de prise type 3c',
		'socket:type3c:output': 'Puissance de la prise type 3c',
		'socket:type3c:current': 'Courant de la prise type 3c',
		'socket:type3c:voltage': 'Voltage de la prise type 3c',
		'socket:tesla_standard': 'Nombre de prise Tesla',
		'socket:tesla_standard:output': 'Puissance de la prise Tesla',
		'socket:tesla_standard:current': 'Courant de la prise Tesla',
		'socket:tesla_standard:voltage': 'Voltage de la prise Tesla',
		'socket:tesla_supercharger': 'Nombre de prise Tesla Supercharger',
		'socket:tesla_supercharger:output': 'Puissance de la prise Tesla Supercharger',
		'socket:tesla_supercharger:current': 'Courant de la prise Tesla Supercharger',
		'socket:tesla_supercharger:voltage': 'Voltage de la prise Tesla Supercharger',
		'socket:tesla_supercharger_ccs': 'Nombre de prise Tesla Supercharger CCS',
		'socket:tesla_supercharger_ccs:output': 'Puissance de la prise Tesla Supercharger CCS',
		'socket:tesla_supercharger_ccs:current': 'Courant de la prise Tesla Supercharger CCS',
		'socket:tesla_supercharger_ccs:voltage': 'Voltage de la prise Tesla Supercharger CCS',
		'authentication:contactless': 'Authentification sans-contact',
		'authentication:none': 'Sans authentification',
		'operator:email': "Mail de l'exploitant",
		'compressed_air': 'Air comprimé',
		'area': 'Zone',
		'cinema:3D': 'Cinéma en 3D',
	}[key]
	return found || key
}
export const tagValueCorrespondance = (key: string) => {
	const found = {
		children: 'Enfant',
		only: 'Uniquement',
		customers: 'Clients',
	}[key]
	return found || key
}
