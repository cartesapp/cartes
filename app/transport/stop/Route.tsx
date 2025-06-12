'use client'
import { findContrastedTextColor } from '@/components/utils/colors'
import { omit } from '@/components/utils/utils'
import Image from 'next/image'
import { useState } from 'react'
import { handleColor } from '@/app/itinerary/transit/colors'
import { transportTypeIcon } from '@/components/transit/modeCorrespondance'
import DayView from '../DayView'
import Calendar from './Calendar'
import { RouteLi, RouteNameSpan } from './RouteUI'

export function addMinutes(date, minutes) {
	return new Date(date.getTime() + minutes * 60000)
}

export const nowAsYYMMDD = (delimiter = '') => {
	var d = new Date(),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear()

	if (month.length < 2) month = '0' + month
	if (day.length < 2) day = '0' + day

	return [year, month, day].join(delimiter)
}

const timeFromHHMMSS = (hhmmss) => {
	let [hours, minutes, seconds] = hhmmss.split(':')

	return [hours, minutes, seconds]
}
const toDate = ({ year, month, day }, time) => {
	return new Date(+year, +month - 1, +day, ...time)
}

export const dateFromHHMMSS = (hhmmss) => {
	var d = new Date(),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear()

	if (month.length < 2) month = '0' + month
	if (day.length < 2) day = '0' + day

	const date = toDate({ year, month, day }, timeFromHHMMSS(hhmmss))
	return date
}

export default function Route({ route, stops = [] }) {
	const [calendarOpen, setCalendarOpen] = useState(false)
	const now = new Date()

	const augmentedStops = stops

		.map((stop, i) => {
			const time = timeFromHHMMSS(stop.arrival_time)

			// in Bretagne unified GTFS, all the GTFS were normalized with a technique where each trip has one calendar date entry only
			// Handle both calendar.txt and calendar_dates.txt
			let dates = []

			// Process calendar_dates.txt exceptions
			if (stop.trip.calendarDates) {
				const calendarDates = stop.trip.calendarDates
					.map((calendarDateObject) => {
						if (calendarDateObject.exception_type === 2) return false
						const { date: calendarDate } = calendarDateObject

						const serializedDay = '' + calendarDate,
							year = serializedDay.slice(0, 4),
							month = serializedDay.slice(4, 6),
							day = serializedDay.slice(6)
						const arrivalDate = toDate({ year, month, day }, time)

						const isFuture = arrivalDate > now

						return {
							isFuture,
							arrivalDate,
							day: `${year}-${month}-${day}`,
						}
					})
					.filter(Boolean)
				dates = dates.concat(calendarDates)
			}

			// Process calendar.txt regular service
			if (stop.trip.calendar && stop.trip.calendar.length) {
				const calendars = stop.trip.calendar

				// Process each calendar entry
				calendars.forEach((calendar) => {
					const startDate = new Date(
						('' + calendar.start_date).replace(
							/(\d{4})(\d{2})(\d{2})/,
							'$1-$2-$3'
						)
					)
					const endDate = new Date(
						('' + calendar.end_date).replace(
							/(\d{4})(\d{2})(\d{2})/,
							'$1-$2-$3'
						)
					)

					// Get all dates between start and end where the service runs
					for (
						let d = new Date(startDate);
						d <= endDate;
						d.setDate(d.getDate() + 1)
					) {
						const day = d.getDay()
						const dayMap = {
							0: 'sunday',
							1: 'monday',
							2: 'tuesday',
							3: 'wednesday',
							4: 'thursday',
							5: 'friday',
							6: 'saturday',
						}

						if (calendar[dayMap[day]] === 1) {
							const year = d.getFullYear()
							const month = String(d.getMonth() + 1).padStart(2, '0')
							const dayOfMonth = String(d.getDate()).padStart(2, '0')

							// Check if this date is not cancelled by an exception in calendarDates
							const formattedDate = parseInt(`${year}${month}${dayOfMonth}`)
							const isDateCancelled = stop.trip.calendarDates?.some(
								(exception) =>
									exception.date === formattedDate &&
									exception.exception_type === 2
							)

							if (!isDateCancelled) {
								const arrivalDate = toDate(
									{ year, month, day: dayOfMonth },
									time
								)
								const isFuture = arrivalDate > now
								dates.push({
									isFuture,
									arrivalDate,
									day: `${year}-${month}-${dayOfMonth}`,
								})
							}
						}
					}
				})
			}

			return dates.map((el) => ({ ...omit(['trip'], stop), ...el }))
		})
		.flat()
		.sort((a, b) => a.arrivalDate - b.arrivalDate)

	/*
	const byArrivalDate = new Map(
		augmentedStops.map((el) => {
			return [el.arrival_time, el]
		})
	)
	*/

	const today = nowAsYYMMDD('-')
	const stopsToday = augmentedStops.filter((el) => el.day === today)

	const stopSelection = stopsToday.filter((el) => el.isFuture).slice(0, 4)

	const headSigns = stops[0].trip.trip_headsign != null && [
		...new Set(stops.map((stop) => stop.trip.trip_headsign)),
	]
	const destinations = !headSigns && [
		...new Set(stops.map((stop) => stop.trip.destination)),
	]

	const safeDestinations = headSigns || destinations
	const name = safeDestinations[0]
	const directions = stops.map(({ trip }) => trip.direction_id)
	const otherDirection = directions[0] === 0 ? 1 : 0
	const index = directions.findIndex((i) => i === otherDirection)
	const hasMultipleTripDirections = index > -1
	console.log('olive stop route', route, name, stops) // direction, nameParts, name, stops)

	return (
		<RouteLi>
			<RouteName route={route} name={name} />
			{route.route_type === 3 &&
				hasMultipleTripDirections && ( // this route_type is probably here because lots of metro stations are unique with obviously two directions, without a potential for misunderstanding
					<div>
						<span>⚠️</span>
						<small>
							Attention, plusieurs directions d'une même ligne de bus s'arrêtent
							à cet arrêt.
						</small>
					</div>
				)}
			{safeDestinations.length > 1 && (
				<div>
					<span>⚠️</span>
					<small>Attention, cette ligne a plusieurs destinations.</small>
				</div>
			)}
			<ul>
				{stopSelection.map((stop, i) => (
					<li key={stop.trip_id}>
						<small>{humanDepartureTime(stop.arrivalDate, i === 0)}</small>
					</li>
				))}
				<button onClick={() => setCalendarOpen(!calendarOpen)}>
					<span>🗓️</span>
				</button>
			</ul>
			{calendarOpen && <Calendar data={augmentedStops} />}
			<DayView data={stopsToday} />
		</RouteLi>
	)
}

export const RouteName = ({ route, name = undefined }) => {
	const color = route.route_color
		? findContrastedTextColor(route.route_color, true)
		: '#ffffff'
	const backgroundColor = handleColor(route.route_color, 'gray')

	const givenShortName = route.route_short_name || '',
		shortName = givenShortName.match(/^[A-z]$/)
			? givenShortName.toUpperCase()
			: givenShortName
	return (
		<RouteNameSpan $backgroundColor={backgroundColor} $color={color}>
			<Image
				src={transportTypeIcon(route.route_type, route)}
				alt="Icône d'un bus"
				width="100"
				height="100"
			/>
			<small>
				<strong>{shortName}</strong>{' '}
				<span>{name || route.route_long_name}</span>
			</small>
		</RouteNameSpan>
	)
}

export const humanDepartureTime = (date, doPrefix) => {
	const departure = date.getTime()
	const now = new Date()

	const seconds = (departure - now.getTime()) / 1000

	const prefix = doPrefix ? 'Dans ' : ''
	const minutes = seconds / 60

	if (seconds < 60) return `${prefix} ${Math.round(seconds)} sec`
	if (minutes < 60) return `${prefix} ${Math.round(minutes)} min`

	const prefix2 = doPrefix ? 'À ' : ''
	const hours = date.getHours(),
		humanHours = +hours >= 10 ? hours : '0' + hours
	const human = `${prefix2}${humanHours}h${prefixWithZero(date.getMinutes())}`

	return human
}

const prefixWithZero = (minutes) =>
	('' + minutes).length === 1 ? '0' + minutes : minutes
