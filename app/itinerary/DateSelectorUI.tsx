import { styled } from 'next-yak'
export const Wrapper = styled.div`
	margin-top: 0.2rem;
	display: flex;
	align-items: center;
	justify-content: end;
`

export const NowButton = styled.span`
	display: flex;
	align-items: center;
	button {
		margin: 0;
		padding: 0;

		img {
			width: 1.6rem;
			height: auto;
			vertical-align: sub;
			margin-left: 0.2rem;
		}
	}
`

export const DateInput = styled.input`
	margin-right: 0.4rem !important;
	margin-left: 0.4rem !important;
	font-size: 110%;
	height: 1.4rem;
	padding: 0 0.2rem;
	color: var(--darkerColor);
	border: 2px solid var(--darkColor);
	border-radius: 0.15rem;
`

export const QuickDateWardButton = styled.button`
	padding: 0;
	margin: 0;
	margin-left: 0.2rem;
	margin-bottom: 0.2rem;
	img {
		width: 1.5rem;
		height: auto;
		vertical-align: middle;
	}
`

export const CalendarCloseButton = styled.button`
	padding: 0;
	margin: 0;
	margin-left: 0.2rem;
	margin-bottom: 0.2rem;
	img {
		width: 1.2rem;
		height: auto;
		vertical-align: middle;
		margin-right: 0.1rem;
	}
`
