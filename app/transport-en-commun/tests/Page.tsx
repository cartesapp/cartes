import { PresentationWrapper } from '@/app/presentation/UI'
import StaticPageHeader from '@/components/StaticPageHeader'
import { css } from 'next-yak'

export const title = 'Tableau de bord de test des transports'
export const description = `
Observez nos tests des trajets de transport en commun, qui assurent la fiabilité du service en vérifiant que le serveur de calcul est toujours en ligne et que les mises à jour de ses données ont été faites.
`
export default async function Page() {
	return (
		<PresentationWrapper>
			<StaticPageHeader small={true} />
			<header>
				<h1>{title}</h1>
				<p>{description}</p>
			</header>

			<section
				css={css`
					margin: 2rem 0;
				`}
			>
				Coucou
			</section>
		</PresentationWrapper>
	)
}
