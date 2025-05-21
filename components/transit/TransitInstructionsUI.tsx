import { styled } from 'next-yak'

export const Wrapper = styled.div`
	position: relative;
	h2 {
		font-weight: 600;
		margin-bottom: 0.4rem;
	}
	section {
	}
`
export const Transports = styled.div`
	margin: 0.6rem 0.4rem;
	ol {
		list-style-type: none;
	}
	details {
		summary {
			padding-left: 0.5rem;
			color: var(--darkColor);
			list-style-type: none;
		}
	}
`

export const NoTransitLeg = styled.section`
	font-size: 90%;
	color: #333;
	margin: 0.6rem 0;
	> img {
		width: 1.4rem;
		height: auto;
		vertical-align: bottom;
	}
`
export const StationWrapper = styled.section`
	margin: 0.6rem 0 0.6rem -0.5rem;
	display: flex;
	align-items: center;
	svg {
		margin-bottom: -0.05rem;
	}
	> span {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		line-height: 0.85rem;
	}
	> small {
		color: gray;
	}
	width: 16rem;
	justify-content: space-between;
	${(p) => p.$last && `position: absolute; bottom: -.8rem; left: 0`}
`
export const Transport = styled.li`
	border-left: 4px solid ${(p) => p.$transport.routeColor};
	> span {
		border-top-right-radius: 0.3rem;
		border-bottom-right-radius: 0.3rem;
		padding: 0.1rem 0.4rem;
		margin-bottom: 0.4rem;
		img {
			height: 1rem;
		}
	}
	margin-bottom: 0.2rem;
	padding-bottom: 1.2rem;
	position: relative;
`
