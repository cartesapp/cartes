import { hours, minutes } from '@/app/itinerary/transit/utils'

export const getTimePart = (searchParam) =>
	searchParam.split('-')[1].split('min')[0]

const decodeStepModeParam = (param) => {
	if (param == null) return { time: null, mode: null }
	const [modeStart, timeStartRaw] = param.split('-')
	const timeStart = timeStartRaw.split('min')[0]
	return { time: timeStart, mode: modeStart }
}
export const decodeStepModeParams = (searchParams) => {
	try {
		const { debut, fin } = searchParams

		const start = decodeStepModeParam(debut)
		const end = decodeStepModeParam(fin)

		const result = {
			start,
			end,
		}
		console.log('indigo decoded', result)
		return result
	} catch (e) {
		console.error('Error decoding start mode, start time, or end...', e)
	}
}

export const stepModeParamsToMotis = (
	stepModeParams,
	distance,
	whichPart: 'start' | 'end'
) => {
	const { mode, time } = stepModeParams

	const modeKey = `${whichPart === 'start' ? 'pre' : 'post'}TransitModes`

	const durationKey = `max${whichPart === 'start' ? 'Pre' : 'Post'}TransitTime`

	if (mode?.startsWith('marche') && time)
		return {
			[modeKey]: ['WALK'],

			PedestrianProfile: mode.startsWith('marchereduite')
				? 'WHEELCHAIR' // It looks like the default profile is already tuned for handicaped people, but I could be wrong. We miss a documentation of the profiles here https://github.com/motis-project/ppr/tree/master/profiles
				: // TODO add the accessibility / wheelchair and other options.
				  // Does it incur a processing cost and file weight ? Yes,
				  // profiles need to be set before compilation https://github.com/motis-project/motis/issues/364
				  // MAJ : It looks like PPR profiles are in the config file but
				  // do not occur a new rebuilding of the PPR cache data :)
				  'FOOT',

			[durationKey]: minutes(time),
		}

	if (mode === 'vélo' && time)
		return {
			[modeKey]: ['BIKE'],
			[durationKey]: minutes(time),
		}

	if (mode === 'voiture' && time)
		return {
			[modeKey]: ['CAR'],
			[durationKey]: minutes(time),
		}

	return {
		[modeKey]: ['WALK'],

		PedestrianProfile: 'FOOT',
		[durationKey]: minutes(15),
	}
}
