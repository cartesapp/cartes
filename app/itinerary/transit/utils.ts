export const filterNextConnections = (connections, date) =>
	connections.filter(
		(connection) => stamp(connection.startTime) > stamp(date) - 60 // motis ontrip requests should not be filtered out
	)

export const humanDuration = (seconds) => {
	if (seconds < 60) {
		const text = `${seconds} secondes`

		return { interval: `toutes les ${seconds} secondes`, single: text }
	}
	const minutes = seconds / 60
	if (minutes > 15 - 2 && minutes < 15 + 2)
		return { interval: `tous les quarts d'heure`, single: `Un quart d'heure` }
	if (minutes > 30 - 4 && minutes < 30 + 4)
		return { interval: `toutes les demi-heures`, single: `Une demi-heure` }
	if (minutes > 45 - 4 && minutes < 45 + 4)
		return {
			interval: `tous les trois quarts d'heure`,
			single: `trois quarts d'heure`,
		}
	if (minutes > 60 - 4 && minutes < 60 + 4)
		return {
			interval: `toutes les heures`,
			single: `une heure`,
		}

	if (minutes < 60) {
		const text = `${Math.round(minutes)} min`
		return { interval: `toutes les ${text}`, single: text }
	}
	const hours = minutes / 60

	if (hours < 5) {
		const rest = Math.round(minutes - hours * 60)

		const text = `${Math.floor(hours)} h${rest > 0 ? ` ${rest} min` : ''}`
		return { interval: `Toutes les ${text}`, single: text }
	}
	const text = `${Math.round(hours)} heures`
	return { interval: `toutes les ${text}`, single: text }
}
export const dateFromMotis = (timestamp) => new Date(timestamp * 1000)
export const formatMotis = (timestamp) =>
	startDateFormatter.format(dateFromMotis(timestamp))

export const formatIsoDate = (isoDate) =>
	startDateFormatter.format(new Date(isoDate))

export const startDateFormatter = Intl.DateTimeFormat('fr-FR', {
	hour: 'numeric',
	minute: 'numeric',
})

export const datePlusHours = (date, hours) => {
	const today = new Date(date)
	const newToday = today.setHours(today.getHours() + hours)
	return Math.round(newToday / 1000)
}

export const nowStamp = () => Math.round(Date.now() / 1000)

export const stamp = (date = undefined) =>
	Math.round(new Date(date).getTime() / 1000)

export const defaultRouteColor = '#d3b2ee'

export const hours = (num) => num * 60 * 60,
	minutes = (num) => num * 60

export const initialDate = (type = 'date', givenDate) => {
	const baseDate = givenDate ? new Date(givenDate) : new Date()
	const stringDate = baseDate.toISOString()

	const day = stringDate.split('T')[0]
	if (type === 'day') return day

	return stringDate.slice(0, 16) + 'Z' // we don't want second precision in the URL. Minute is enough for transit user input
}

export const isDateNow = (date, diff = 5) => {
	const now = nowStamp()
	const dateStamp = stamp(date)

	const difference = dateStamp - now

	console.log('lightgreen diff in minutes', difference / 60)
	return difference < 60 * diff // 5 minutes
}

export const encodeDate = (date) => date?.replace(/:/, 'h')
export const decodeDate = (date) => date?.replace(/h/, ':')
export function addMinutes(date, minutes) {
	return new Date(date.getTime() + minutes * 60000)
}
