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

		return {
			start,
			end,
		}
	} catch (e) {
		console.error('Error decoding start mode, start time, or end...', e)
	}
}

export const stepModeParamsToMotis = (stepModeParams, distance) => {
	const { mode, time } = stepModeParams

	// This is the state of the art of our comprehension of how to use Motis to
	// produce useful intermodal results in France, letting the user find the
	// closest train station for more long range requests
	// See https://github.com/laem/cartes/issues/416
	//
	// Here we set a threshold in km (50) for either not asking a trip starting with a bike
	// segment because we expect the user will use local transit, or ask it with a
	// max bike duration request depending on the distance :
	// 1h of bike ~= 20km for trips lower than 200 km
	// 2h and 40 km for trips more than 200 km
	//
	// With thiese settings, we should cover most of the hexagone.
	const bikeTrainSearchDistance = //0 * 60
		hours(distance < 10 ? 0 : distance < 200 ? 1 : 2)

	console.log('lightgreen motis intermodal', {
		distance,
		bikeTrainSearchDistance: bikeTrainSearchDistance / 60 + ' min',
	})
	// symmetric because used for start and destination for now
	const symmetricModes =
		!mode || !time
			? [
					{
						mode_type: 'FootPPR',
						mode: {
							search_options: {
								profile: 'distance_only',
								duration_limit: minutes(15),
							},
						},
					},
					bikeTrainSearchDistance > 0 && {
						mode_type: 'Bike',
						mode: {
							max_duration: bikeTrainSearchDistance,
						},
					},
			  ].filter(Boolean)
			: mode.startsWith('marche')
			? [
					{
						mode_type: 'FootPPR',
						mode: {
							search_options: {
								profile: mode.startsWith('marchereduite')
									? 'wheelchair' // It looks like the default profile is already tuned for handicaped people, but I could be wrong. We miss a documentation of the profiles here https://github.com/motis-project/ppr/tree/master/profiles
									: // TODO add the accessibility / wheelchair and other options.
									  // Does it incur a processing cost and file weight ? Yes,
									  // profiles need to be set before compilation https://github.com/motis-project/motis/issues/364
									  // MAJ : It looks like PPR profiles are in the config file but
									  // do not occur a new rebuilding of the PPR cache data :)
									  'distance_only',
								duration_limit: minutes(time),
							},
						},
					},
			  ]
			: mode === 'vélo'
			? [
					{
						mode_type: 'Bike',
						mode: {
							max_duration: minutes(time),
						},
					},
			  ]
			: [
					{
						mode_type: 'Car',
						mode: {
							max_duration: minutes(time),
						},
					},
			  ]

	return symmetricModes
}
