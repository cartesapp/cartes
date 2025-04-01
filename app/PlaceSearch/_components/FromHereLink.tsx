import { buildAllezPart } from '@/app/SetDestination'
import useSetSearchParams from '@/components/useSetSearchParams'
import Link from 'next/link'
import Image from 'next/image'
import geolocateIcon from '@/public/geolocate.svg'
import { styled } from 'next-yak'

export function FromHereLink({ geolocation, searchParams, state }) {
	const setSearchParams = useSetSearchParams()

	const allezPart = buildAllezPart(
		'Ma position',
		null,
		geolocation.longitude,
		geolocation.latitude
	)

	const allez = state
		.map((step) => (step.stepBeingSearched ? allezPart : step.allezValue))
		.join('->')

	const href = setSearchParams(
		{
			allez,
		},
		true
	)

	return (
		<StyledLink href={href}>
			<Image
				src={geolocateIcon}
				alt="Icône représentant la géolocalisation de l'utilisateur"
			/>
			Choisir ma position
		</StyledLink>
	)
}
const StyledLink = styled(Link)`
	display: flex;
	padding: 0;
	margin: 0 auto;
	justify-content: center;
	text-decoration: underline;
	text-decoration-color: var(--lightColor);
	text-decoration-thickness: 2px;

	align-items: center;
	> img {
		width: 2rem;
		height: 2rem;
		border-radius: 0.6rem;
	}
`
