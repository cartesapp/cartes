import { styled } from 'next-yak'
import Link from 'next/link'
import useSetSearchParams from './useSetSearchParams'
import LogoCarteApp from '@/app/PlaceSearch/_components/LogoCarteApp'
import Image from 'next/image'
import reduceLeftPanelIcon from '@/public/reduce-left-panel.svg'

export default function LeftVerticalBar() {
	const setSearchParams = useSetSearchParams()
	return (
		<Aside>
			<button>
				<Image src={reduceLeftPanelIcon} alt="Réduire le panneau de gauche" />
			</button>
			<AboutLink href={setSearchParams({ intro: true }, true)}>
				<small>?</small>
			</AboutLink>
		</Aside>
	)
}

const AboutLink = styled(Link)`
	float: right;
	position: absolute;
	color: var(--lighterColor);
	padding: 0rem 0.3rem 0.05rem 0.3rem;
	line-height: 1.1rem;
	border: 2px solid var(--lighterColor);
	border-radius: 2rem;
	left: 0.8rem;
	font-weight: bold;
	bottom: 1rem;
	z-index: 1000;
`

const Aside = styled.aside`
	height: 100vh;
	width: 3rem;
	background: var(--lightestColor2) !important;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 10;
	--shadow-color: 217deg 49% 38%;
	--shadow-elevation-medium: 0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.29),
		0.7px 1.3px 1.7px -0.6px hsl(var(--shadow-color) / 0.29),
		1.3px 2.6px 3.3px -1.2px hsl(var(--shadow-color) / 0.29),
		2.6px 5.2px 6.5px -1.9px hsl(var(--shadow-color) / 0.29),
		5px 10px 12.6px -2.5px hsl(var(--shadow-color) / 0.29);
	box-shadow: var(--shadow-elevation-medium);

	padding: 0.6rem 0.2rem;
	button {
		border: 0;
		background: none;
		margin: 0 auto;
		padding: 0;
		display: block;
		opacity: 0.6;
		img {
			width: 1.2rem;
			height: auto;
		}
	}
`
