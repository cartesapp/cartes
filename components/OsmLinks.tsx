import osmLogo from '@/public/openstreetmap.svg'
import { styled } from 'next-yak'
import Image from 'next/image'

export default function OsmLinks({
	data: { type: featureType2, featureType: featureType1, id },
}) {
	const featureType = featureType1 || featureType2
	return (
		<Wrapper>
			<a
				href={`https://openstreetmap.org/${featureType}/${id}`}
				target="_blank"
				title="Voir la fiche OpenStreetMap de ce lieu"
			>
				<Image
					src={osmLogo}
					width="30"
					height="30"
					alt="Logo d'OpenStreetMap"
				/>
			</a>
			<a
				href={`https://openstreetmap.org/edit?${featureType}=${id}`}
				target="_blank"
				title="Ajouter des informations à ce lieu sur OpenStreetMap"
			>
				Compléter ce lieu sur OpenStreetMap
			</a>
		</Wrapper>
	)
}

const Wrapper = styled.section`
	display: flex;
	margin-top: 2rem;
	margin-bottom: 0.2rem;
	justify-content: center;
	align-items: center;
	img {
		width: 1.6rem;
		height: auto;
		margin-right: 0.4rem;
		vertical-align: middle;
	}
	background: white;
	border: 1px solid var(--lightestColor);
	border-radius: 0.4rem;
	padding: 0.3rem 0.8rem;
	font-size: 80%;
	a {
		color: #333;
		text-decoration: none;
	}
`
