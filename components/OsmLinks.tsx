import { decodePlace } from '@/app/utils'
import osmLogo from '@/public/openstreetmap.svg'
import { styled } from 'next-yak'
import Image from 'next/image'

export default function OsmLinks({ data }) {
	const [featureType, id] = decodePlace(data.osmCode)
	const { meta } = data
	// Formatage en français de la date du dernier changeset
	const changesetDate = new Date(meta.timestamp)
	const options = {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}
	const frenchDate = changesetDate.toLocaleDateString('fr-FR', options)

	return (
		<Section>
			<div>
				{meta && (
					<small>
						mis à jour le {frenchDate} par{' '}
						<a
							href={`https://www.openstreetmap.org/user/${meta.user}`}
							target="_blank"
							title={`Lien vers la fiche OSM de l'utilisateur ${meta.user}`}
						>
							{meta.user}
						</a>
					</small>
				)}
			</div>
			<OsmLinksWrapper>
				<Image
					src={osmLogo}
					width="30"
					height="30"
					alt="Logo d'OpenStreetMap"
				/>
				<a
					href={`https://openstreetmap.org/${featureType}/${id}`}
					target="_blank"
					title="Voir la fiche OpenStreetMap de ce lieu"
				>
					Voir
				</a>
				&nbsp;ou&nbsp;
				<a
					href={`https://openstreetmap.org/edit?${featureType}=${id}`}
					target="_blank"
					title="Ajouter des informations à ce lieu sur OpenStreetMap"
				>
					compléter
				</a>
				&nbsp;ce lieu sur OpenStreetMap
			</OsmLinksWrapper>
		</Section>
	)
}

const Section = styled.section`
	margin-top: 2rem;
	margin-bottom: 0.2rem;
	> div {
		margin-bottom: 0.3rem;
		> small {
			margin-right: 0.4rem;
			color: var(--darkerColor);
			text-align: right;
		}
	}
`
const OsmLinksWrapper = styled.section`
	display: flex;
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
