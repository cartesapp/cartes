 import Emoji from '@/components/Emoji'
 import { findContrastedTextColor } from '@/components/utils/colors'
 import { omit } from '@/components/utils/utils'
 import Image from 'next/image'
 import { useState } from 'react'
 import { handleColor } from '../../itinerary/transit/motisRequest'
 import { transportTypeIcon } from '../../itinerary/transit/transportIcon'
 import DayView from '../DayView'
 import Calendar from './Calendar'
 
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
 			const dates = stop.trip.calendarDates
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
 
 	const directions = stops.map(({ trip }) => trip.direction_id)
 	const otherDirection = directions[0] === 0 ? 1 : 0
 	const index = directions.findIndex((i) => i === otherDirection)
 	const hasMultipleTripDirections = index > -1
 	const direction = directions[0],
 		rawName =
 			route.route_long_name || route.route_short_name || 'ligne sans nom',
 		// Here we're deriving the directed name from the raw name. They don't help
 		// us here :D haven't found a better way to display the correct trip name...
 		//
 		//"Rennes (La Poterie)  Vezin-le-Coquet (ZI Ouest)"
 		// "Cesson-Sévigné (Cesson - Viasilva)  Rennes   Chantepie (Rosa Parks)"
 		nameParts = rawName.match(/\s\s/)
 			? rawName.split(/\s\s/)
 			: // "PLOUZANÉ Bourg - BREST Amiral Ronarc’h"
 			rawName.match(/\s-\s/)
 			? rawName.split(/\s-\s/)
 			: null,
 		name = nameParts
 			? (direction === 1 ? nameParts.reverse() : nameParts).join(' → ')
 			: rawName
 
 	return (
 		<li
 			css={css`
 				margin-top: 0.8rem;
 				margin-bottom: 1.4rem;
 			`}
 		>
 			<RouteName route={route} name={name} />
 			{route.route_type === 3 && hasMultipleTripDirections && (
 				<div
 					css={css`
 						display: flex;
 						align-items: center;
 						small {
 							line-height: 1rem;
 						}
 					`}
 				>
 					<Emoji e="⚠️" />{' '}
 					<small>
 						Attention, plusieurs directions d'une même ligne de bus s'arrêtent à
 						cet arrêt.
 					</small>
 				</div>
 			)}
 			<ul
 				css={css`
 					display: flex;
 					justify-content: end;
 					list-style-type: none;
 					li {
 						margin-right: 0.6rem;
 						border-right: 2px solid var(--lighterColor);
 						padding-right: 0.6rem;
 						line-height: 1rem;
 						display: flex;
 						align-items: center;
 					}
 					li:last-child {
 						border-right: none;
 					}
 				`}
 			>
 				{stopSelection.map((stop, i) => (
 					<li key={stop.trip_id}>
 						<small>{humanDepartureTime(stop.arrivalDate, i === 0)}</small>
 					</li>
 				))}
 				<button onClick={() => setCalendarOpen(!calendarOpen)}>
 					<Emoji e="🗓️" />
 				</button>
 			</ul>
 			{calendarOpen && <Calendar data={augmentedStops} />}
 			<DayView data={stopsToday} />
 		</li>
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
 		<span
 			css={css`
 				display: flex;
 				align-items: center;
 				justify-content: start;
 				img {
 					height: 1.2rem;
 					width: auto;
 					margin-right: 0.2rem;
 					opacity: 0.6;
 				}
 			`}
 		>
 			<Image
 				src={transportTypeIcon(route.route_type, route)}
 				alt="Icône d'un bus"
 				width="100"
 				height="100"
 			/>
 			<small
 				css={css`
 					strong {
 						background: ${backgroundColor};
 						padding: 0 0.25rem;
 						border-radius: 0.3rem;
 						color: ${color};
 					}
 					span {
 						text-decoration: underline;
 						text-decoration-color: ${backgroundColor};
 						text-decoration-thickness: 2px;
 					}
 
 					white-space: nowrap;
 					width: 100%;
 					overflow: scroll;
 					touch-action: pan-x;
 					height: fit-content;
 					&::-webkit-scrollbar {
 						display: none;
 					}
 					scrollbar-width: none;
 				`}
 			>
 				<strong>{shortName}</strong>{' '}
 				<span>{name || route.route_long_name}</span>
 			</small>
 		</span>
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
