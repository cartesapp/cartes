 import { css } from 'next-yak'
 import { useEffect, useRef, useState } from 'react'
 import { nowAsYYMMDD } from './Route'
 
 const now = new Date()
 export default function Calendar({ data }) {
 	const today = nowAsYYMMDD('-')
 	const [day, setDay] = useState(today)
 
 	const actualTimes = data.filter((el) => el.day === day)
 
 	// 48 and not 24, because the bus passing at 2h this night will be marked as
 	// passing at 25h
 	const hours = [...Array(48).keys()].map((hour) => {
 		const str = '' + hour
 
 		return str.length === 1 ? '0' + hour : hour
 	})
 
 	const hoursObject = Object.fromEntries(hours.map((h) => [h, []]))
 
 	const stopByHour = actualTimes.reduce((memo, next) => {
 		const thisHour = next.arrival_time.split(':')[0]
 		return { ...memo, [thisHour]: [...memo[thisHour], next] }
 	}, hoursObject)
 
 	const thisHours = new Date().getHours()
 
 	const relevantHourRef = useRef(null)
 	useEffect(() => {
 		if (!relevantHourRef || !relevantHourRef.current) return
 		relevantHourRef.current.scrollIntoView({
 			behavior: 'smooth',
 			inline: 'start',
 			block: 'center',
 		})
 	}, [relevantHourRef, thisHours])
 
 	return (
 		<div>
 			<input
 				type="date"
 				id="busStopTimesDate"
 				name="busStopTimesDate"
 				value={day}
 				min={today}
 				onChange={(e) => setDay(e.target.value)}
 				css={css`
 					cursor: pointer;
 					margin-top: 0.6rem;
 					display: block;
 					margin: auto 0 auto auto;
 				`}
 			/>
 			<div
 				css={css`
 					max-width: 100%;
 					white-space: nowrap;
 					overflow: scroll;
 				`}
 			>
 				<ul
 					css={css`
 						margin-top: 0.6rem;
 						display: flex;
 						width: auto;
 						scrollbar-width: none;
 						list-style-type: none;
 						text-align: center;
 						li {
 							padding: 0;
 						}
 						> li > strong {
 							font-size: 90%;
 							background: var(--darkColor);
 							color: var(--lightestColor);
 							width: 2.6rem;
 							display: block;
 							border-right: 2px solid var(--lighterColor);
 						}
 						> li:nth-child(even) {
 							background: var(--lighterColor);
 						}
 
 						ul {
 							display: flex;
 							list-style-type: none;
 							flex-direction: column;
 						}
 					`}
 				>
 					{Object.entries(stopByHour)
 						.sort(([h1], [h2]) => +h1 - +h2)
 						.map(
 							([hour, entries]) =>
 								entries.length > 0 && (
 									<li
 										key={hour}
 										ref={hour == thisHours ? relevantHourRef : null}
 									>
 										<strong>{hour % 24} h</strong>
 										<ul>
 											{entries.map((entry) => (
 												<li
 													key={entry.arrival_time}
 													style={{
 														opacity: entry.arrivalDate < now ? 0.3 : 1,
 													}}
 												>
 													{entry.arrival_time.split(':')[1]}
 												</li>
 											))}
 										</ul>
 									</li>
 								)
 						)}
 				</ul>
 			</div>
 		</div>
 	)
 }
