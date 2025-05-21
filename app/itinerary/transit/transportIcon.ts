//TODO complete with spec possibilities https://gtfs.org/fr/schedule/reference/#routestxt
export default function (frenchTrainType, prefix) {
	if (frenchTrainType) return `/transit/${frenchTrainType.toLowerCase()}.svg`
	// blablabus was an error, will be blablacar in next motis update
	return ['flixbus', 'blablabus', 'blablacar'].includes(prefix)
		? `/transit/${prefix}.svg`
		: null
}

const typeIconCorrespondance = {
	0: '/icons/tram.svg',
	1: '/icons/metro.svg',
	2: '/icons/train.svg',
	3: '/icons/bus.svg',
	4: '/icons/ferry.svg',
	5: '/icons/tram.svg',
	6: '/icons/téléphérique.svg',
	7: '/icons/funiculaire.svg',
	11: '/icons/trolleybus.svg',
	12: '/icons/train.svg', // how to represent this ?
}

export function transportTypeIcon(routeType, route) {
	if (route?.route_id === 'BIBUS:C') return typeIconCorrespondance[6] // LOL, merci bibus, you had one job...
	const found = typeIconCorrespondance[routeType]
	return found || '/icons/bus.svg'
}

const routeTypeCorrespondance = {
	0: 'tram',
	1: 'métro',
	2: 'train',
	3: 'bus',
	4: 'ferry',
	5: 'tram à câble', // so rare
	6: 'téléphérique',
	7: 'funiculaire',
	11: 'trolleybus',
	12: 'monorail', // how to represent this ?
}

export const routeTypeName = (routeType) => {
	return routeTypeCorrespondance[routeType]
}

const motisModeCorrespondance = {
	TRAM: 'tramway',
	SUBWAY: 'métro',
	FERRY: 'ferry',
	AIRPLANE: 'avion',
	BUS: 'bus',
	COACH: 'car',
	RAIL: 'rail',
	HIGHSPEED_RAIL: 'TGV',
	LONG_DISTANCE: 'intercité',
	NIGHT_RAIL: 'train de nuit',
	REGIONAL_FAST_RAIL: 'TER',
	REGIONAL_RAIL: 'TER',
	METRO: 'métro',
}

const motisModeIconCorrespondance = {
	TRAM: '/icons/tram.svg',
	METRO: '/icons/metro.svg',
	SUBWAY: '/icons/metro.svg',
	RAIL: '/icons/train.svg',
	HIGHSPEED_RAIL: '/icons/train.svg',
	LONG_DISTANCE: '/icons/train.svg',
	NIGHT_RAIL: '/icons/train.svg',
	REGIONAL_FAST_RAIL: '/icons/train.svg',
	REGIONAL_RAIL: '/icons/train.svg',
	BUS: '/icons/bus.svg',
	COACH: '/icons/bus.svg',
	FERRY: '/icons/ferry.svg',
	//	: '/icons/téléphérique.svg',
	//	: '/icons/funiculaire.svg',
	//: '/icons/trolleybus.svg',
}
