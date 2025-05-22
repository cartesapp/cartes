import { styled } from 'next-yak'
import Image from 'next/image'

export const TortoiseImage = styled(Image)`
	margin-right: 0.3rem;
	width: 1rem;
	cursor: pointer;
	opacity: ${(p) => (p.$tortue ? 1 : 0.3)};
`
export const Section = styled.section`
	margin: 0.8rem 0.4rem;
	img {
		width: 1.4rem;
		height: auto;
	}
	ol {
		list-style-type: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}
`

export const Correspondances = styled.span`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	color: white;
	font-size: 70%;
	font-weight: bold;
`

export const Infinite = styled.div`
	font-size: 140%;
	max-height: 0.8rem;
	line-height: 0.2rem;
`
export const NotInfinite = styled.div`
	font-size: 100%;
	line-height: 0.8rem;
	white-space: nowrap;
`

export const ModeHr = styled.div`
	position: absolute;
	top: calc(50% - 1px);
	width: 6rem;
	background: linear-gradient(
		90deg,
		var(--lighterColor) 0%,
		transparent 30%,
		transparent 80%,
		var(--color) 100%
	);
	height: 2px;
`

export const ModeImage = styled(Image)`
	height: 2rem !important;
	width: auto !important;
	filter: invert(46%) sepia(13%) saturate(5002%) hue-rotate(181deg)
		brightness(92%) contrast(88%);
`

export const ModeTimeButton = styled.button`
	border: 2px solid var(--color);
	color: var(--color);
	border-radius: 3rem;
	width: 1.4rem;
	height: 1.4rem;
	text-align: center;
	font-size: 75%;
	position: relative;
	> div {
		position: absolute;
		top: 50%;
		left: 52%;
		transform: translate(-50%, -50%);
		line-height: 1.1rem;
		div,
		small {
			line-height: 0.65rem;
		}
	}
	> span {
		height: 4px;
		width: 4px;
		position: absolute;
		top: -5px;
		left: 42%;
		background: var(--color);
	}
`
