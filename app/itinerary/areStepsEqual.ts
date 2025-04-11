const coordinates = (step) =>
	step && step.center ? step.center.geometry.coordinates.join('<>') : '?'
export const geoSerializeSteps = (steps) => steps.map(coordinates).join('->')
