import closeIcon from '@/public/close-circle-stroke.svg'
import Image from 'next/image'
import { styled, css } from 'next-yak'
import { colors } from './styles/france'

const oceanColor = colors.light.ocean

export const MapContainer = styled.div`
	${(p) =>
		!p.$isMapLoaded
			? css`
					background: #71a0e9;
			  `
			: css`
					background: black;
			  `};
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	> div:last-child {
		position: absolute;
		width: 100%;
		height: 100%;
	}
	> a {
		position: absolute;
		left: 10px;
		bottom: 10px;
		z-index: 999;
	}
	color: var(--darkestColor);
`

export const ModalCloseButton = (props) => (
	<ModalCloseButtonButton {...props}>
		<Image src={closeIcon} alt="Fermer" />
	</ModalCloseButtonButton>
)
export const ModalCloseButtonButton = styled.button`
	position: absolute;
	top: 0.4rem;
	right: 0rem;
	margin: 0;

	text-align: center;
	cursor: pointer;
	padding: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	> img {
		width: 1.4rem;
		height: auto;
		margin: 0;
		opacity: 0.6;
		border-radius: 1.4rem;
	}
`

export const DialogButton = styled.button`
	background: var(--darkColor);
	color: white;
`
