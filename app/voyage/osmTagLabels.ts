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
					break;
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

export const tagNameCorrespondance = (key: string) => {
	const found = {
		'books': 'Livres',
		'brand:website': 'Site de la marque',
		'building:levels': "Nombre d'étages",
		'bulk_purchase': 'Achat en vrac',
		'capacity:disabled': 'Place de parking PMR',
		'check_date:opening_hours': 'Horaires vérifiés le',
		'diet:vegan': 'Végan',
		'diet:vegetarian': 'Végétarien',
		'emergency:phone': "Numéro d'urgence",
		'female': 'Pour les femmes',
		'indoor_seating': "Sièges à l'intérieur",
		'internet_access:fee': 'Accès Internet payant',
		'male': 'Pour les hommes',
		'official_name': 'Nom officiel',
		'old_name': 'Ancien nom',
		'opening_hours:emergency': "Horaires en cas d'urgence",
		'opening_hours:signed': 'Horaires affichés',
		'pastry': 'Patisserie',
		'payment:card': 'Paiement par carte',
		'payment:cash': 'Paiement en liquide',
		'payment:contactless': 'Paiement sans contact',
		'service:bicycle:repair': 'Réparation de vélos',
		'service:bicycle:retail': 'Vente de vélos',
		'short_name': 'Diminutif',
		'tobacco': 'Vente de tabac',
		'website:menu': 'Menu',
	}[key]
	return found || key
}
export const tagValueCorrespondance = (key: string) => {
	const found = {
		'children': 'Enfant',
		'only': 'Uniquement',
	}[key]
	return found || key
}
