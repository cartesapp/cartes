import parseOpeningHours from 'opening_hours'
import { styled } from 'next-yak'

const getStartOfToday = (date) => {
	const startOfToday = date || new Date()
	startOfToday.setHours(0, 0, 0, 0)
	return startOfToday
}
export const getOh = (opening_hours) => {
	try {
		const oh = new parseOpeningHours(opening_hours, {
				address: { country_code: 'fr' },
			}),
			isOpen = oh.getState(),
			nextChange = oh.getNextChange()

		const intervals = oh.getOpenIntervals(
			getStartOfToday(),
			getStartOfToday(new Date(new Date().setDate(new Date().getDate() + 7)))
		)
		return { isOpen, nextChange, intervals }
	} catch (e) {
		console.log('Error parsing opening hours', e)
		return { isOpen: 'error', nextChange: 'error' }
	}
}

export const OpeningHours = ({ opening_hours }) => {
	const now = new Date()

	const { isOpen, nextChange, intervals } = getOh(opening_hours)

	const formatDate = (date) => {
		const sameDay = date.getDay() === now.getDay()
		const weekday = sameDay ? undefined : 'long'

		const result = new Intl.DateTimeFormat('fr-FR', {
			hour: 'numeric',
			minute: 'numeric',
			weekday,
		}).format(date)
		return result
	}

	const hourFormatter = new Intl.DateTimeFormat('fr-FR', {
		hour: 'numeric',
		minute: 'numeric',
	})

	const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
		weekday: 'long',
	})

	console.log('intervals', intervals)
	const ohPerDay = intervals
		? intervals.reduce(
				(memo, next) => {
					const [from, to] = next
					const fromDay = dayFormatter.format(from)
					const toDay = dayFormatter.format(to)

					const simple = (h) => hourFormatter.format(h).replace(':00', 'h')
					const error = toDay !== fromDay
					const fromHour = simple(from),
						toHour = simple(to)
					const range = fromHour + ' - ' + toHour

					return {
						...memo,
						[fromDay]: [...(memo[fromDay] || []), range],
						error: memo.error || error,
					}
				},
				{
					error: false,
					lundi: [],
					mardi: [],
					mercredi: [],
					jeudi: [],
					vendredi: [],
					samedi: [],
					dimanche: [],
				}
		  )
		: {}

	console.log(ohPerDay)
	return (
		<Wrapper>
			<details open={false}>
				<summary title="Voir tous les horaires">
					<OpenIndicator isOpen={isOpen === 'error' ? false : isOpen} />{' '}
					{isOpen === 'error' && <span>Problème dans les horaires</span>}
					{nextChange === 'error' ? null : !nextChange ? (
						<span>Ouvert 24/24 7j/7</span>
					) : (
						<span>
							{isOpen ? 'Ouvert' : 'Fermé'} jusqu'à {formatDate(nextChange)}
						</span>
					)}
				</summary>

				{intervals != null && !ohPerDay.error ? (
					<ul>
						{Object.entries(ohPerDay).map(
							([day, ranges]) =>
								day !== 'error' && (
									<li key={day} style={!ranges.length ? { color: 'gray' } : {}}>
										<span>{day}</span>
										<ul>
											{ranges.length > 0 ? (
												ranges.map((hour) => <li key={hour}>{hour}</li>)
											) : (
												<span
													style={{
														marginRight: '0.4rem',
													}}
												>
													Fermé
												</span>
											)}
										</ul>
									</li>
								)
						)}
					</ul>
				) : (
					opening_hours
				)}
			</details>
		</Wrapper>
	)
}
const Wrapper = styled.div`
	margin: 0.2rem 0;
	display: flex;
	align-items: center;
	summary {
		list-style-type: none;
		display: flex;
		align-items: center;
	}
	ul {
		padding-left: 2rem;
		width: 100%;
		> li {
			display: flex;
			justify-content: space-between;
			> span {
				margin-right: 2rem;
				width: 7rem;
			}
		}
		> li > ul {
			display: flex;
			list-style-type: none;
			li {
				margin: 0 0.4rem;
			}
		}
	}
`

export const OpenIndicator = ({ isOpen }) => (
	<OpenIndicatorContainer
		$isOpen={isOpen}
		title={isOpen ? 'Ouvert actuellement' : 'Fermé actuellement'}
	/>
)

const OpenIndicatorContainer = styled.span`
	display: inline-block;
	margin: 0 0.4rem;
	width: 1rem;
	height: 1rem;
	border-radius: 2rem;
	background: ${(p) => (p.$isOpen ? '#37c267' : '#b5325d')};
`
