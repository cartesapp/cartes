import Logo from '@/public/logo.svg'
import Image from 'next/image'
import Link from 'next/link'
import { List, Nav } from './UI'
import { description } from './metadata'
import { dateCool } from './utils'
import { allArticles } from './blogArticles'
import News from '@/components/news/News'

export default function Blog({ articles }) {
	return (
		<main>
			<Nav>
				<Link href="/">
					<Image src={Logo} alt="Logo de Cartes.app" width="100" height="100" />
					Revenir sur la carte
				</Link>
			</Nav>
			<h1>Le blog de Cartes.app</h1>
			<p>{description}</p>
			<p>
				Pour l'instant, nous sommes dans une phase de construction : l'objectif
				est de sortir une version 1 en 2024, et ces articles en expliquent
				l'avancement. L'application reste largement utilisable, mais
				attendez-vous à quelques bugs.
			</p>
			<div style={{ margin: '2rem 0' }}>
				<News />
			</div>
			<List>
				{articles.map(
					({ url, date, titre, lang, image, description, tags }) => {
						const enTranslation = allArticles.find(
							(article) => article.original === url.replace('/blog/', '')
						)

						return (
							<li key={url}>
								{image && (
									<Image src={image} alt={description} width="50" height="50" />
								)}
								<div>
									<Link
										href={url}
										dangerouslySetInnerHTML={{ __html: titre.html }}
									/>
								</div>
								<small>publié le {dateCool(date)}</small>
								{lang && lang === 'en' && (
									<span
										style={{ marginLeft: '.4rem' }}
										title="This article is written in english"
									>
										🇬🇧
									</span>
								)}
								{enTranslation && (
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '.4rem',
											marginTop: '2rem',
										}}
										title="This article is written in english"
									>
										🇬🇧{' '}
										<Link
											href={enTranslation.url}
											dangerouslySetInnerHTML={{
												__html: enTranslation.titre.html,
											}}
										/>
									</div>
								)}
								{tags && tags.includes('version') && (
									<small>📌 Notes de version</small>
								)}
							</li>
						)
					}
				)}
			</List>
		</main>
	)
}
