import { atOrUrl } from '@/app/utils'
import { styled } from 'next-yak'
import Image from 'next/image'

// Credits for social network stylized icons : openmoji

export default function ContactAndSocial(data) {
	if (!Object.values(data).filter(Boolean).length) return null
	const {
		bluesky,
		mastodon,
		email,
		facebook,
		instagram,
		whatsapp,
		youtube,
		linkedin,
		siret,
	} = data
	return (
		<Wrapper>
			{email && (
				<a
					href={`mailto:${email}`}
					target="_blank"
					title="Contacter via courriel"
				>
					<Image
						src={'/icons/logos/mail.svg'}
						alt="Icône représentant un mel"
						width="10"
						height="10"
					/>
				</a>
			)}
			{bluesky && (
				<a
					href={atOrUrl(bluesky, 'https://bsky.app')}
					target="_blank"
					title="Compte Bluesky"
				>
					<Image
						src={'/icons/logos/bluesky.svg'}
						alt="Icône du réseau social Bluesky"
						width="10"
						height="10"
					/>
				</a>
			)}
			{mastodon &&
				(mastodon.startsWith('https://') ? (
					<a
						href={
							mastodon //TODO : handle @pseudo@instance.org, rarer but possible
						}
						target="_blank"
						title="Compte Mastodon"
					>
						<Image
							src={'/icons/logos/mastodon.svg'}
							alt="Icône du réseau social Mastodon"
							width="10"
							height="10"
						/>
					</a>
				) : (
					<span>{mastodon}</span>
				))}
			{facebook && (
				<a
					href={atOrUrl(facebook, 'https://facebook.com')}
					target="_blank"
					title="Compte Facebook"
				>
					<Image
						src={'/icons/logos/facebook.svg'}
						alt="Icône du réseau social Facebook"
						width="10"
						height="10"
					/>
				</a>
			)}
			{whatsapp && (
				<a
					href={atOrUrl(whatsapp, 'https://wa.me')}
					target="_blank"
					title="Discuter sur Whatsapp"
				>
					<Image
						src={'/icons/logos/whatsapp.svg'}
						alt="Icône de l'application de discussion instanténée Whatsapp"
						width="10"
						height="10"
					/>
				</a>
			)}
			{instagram && (
				<a
					href={atOrUrl(instagram, 'https://instagram.com')}
					target="_blank"
					title="Compte Instagram"
				>
					<Image
						src={'/icons/logos/instagram.svg'}
						alt="Icône du réseau de partage d'images Instagram"
						width="10"
						height="10"
					/>
				</a>
			)}
			{youtube && (
				<a
					href={atOrUrl(youtube, 'https://youtube.com')}
					target="_blank"
					title="Chaîne Youtube"
				>
					<Image
						src={'/icons/logos/youtube.svg'}
						alt="Icône du réseau de partage de vidéos YouTube"
						width="10"
						height="10"
					/>
				</a>
			)}
			{linkedin && (
				<a
					href={atOrUrl(linkedin, 'https://linkedin.com/company')}
					target="_blank"
					title="Compte LinkedIn"
				>
					<Image
						src={'/icons/logos/linkedin.svg'}
						alt="Icône du réseau de profils professionnels LinkedIn"
						width="10"
						height="10"
					/>
				</a>
			)}
			{siret && (
				<EntrepriseLink
					href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${siret}`}
					target="_blank"
					title="Fiche entreprise sur l'annuaire officiel des entreprises"
				>
					<Image
						src={'/annuaire-entreprises.svg'}
						alt="logo Marianne représentant l'annuaire des entreprises"
						width={14}
						height={14}
					/>
					<span>fiche entreprise</span>
				</EntrepriseLink>
			)}
		</Wrapper>
	)
}

const EntrepriseLink = styled.a`
	display: flex;
	align-items: center;
	img {
		margin: 0 0.3rem 0 0.2rem;
		width: 1.4rem;
		height: auto;
	}
`

const Wrapper = styled.section`
	margin: 0.6rem 0;
	img {
		width: 2rem;
		height: auto;
	}
	display: flex;
	gap: 0.4rem;
	align-items: center;
`
