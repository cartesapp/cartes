import Contribution from '@/app/blog/Contribution'
import ArticleWrapper, {
	BackToBlogLink,
	Translation,
} from '@/components/ArticleUI'
import BlueskyComments from '@/components/BlueskyComments'
import { getMDXComponent } from 'next-contentlayer2/hooks'
import Image from 'next/image'
import OtherArticles from './OtherArticles'
import { mdxComponents } from './mdxComponents'
import { dateCool, getLastEdit } from './utils'
import { getSlug, hasTranslation } from './blogArticles'
import Link from 'next/link'
import Sommaire from './Sommaire'

export default async function Article({ post, slug }) {
	console.log(post.body.code)
	const MDXContent = getMDXComponent(post.body.code)
	const lastEdit = await getLastEdit(slug)

	const sameEditDate =
		!lastEdit || post.date.slice(0, 10) === lastEdit.slice(0, 10)
	const translation = hasTranslation(post)
	return (
		<div>
			<ArticleWrapper>
				{!post.tags?.includes('page') && (
					<BackToBlogLink href="/blog">← Retour au blog</BackToBlogLink>
				)}
				<header>
					{post.image && (
						<Image
							src={post.image}
							width="600"
							height="400"
							alt="Illustration de l'article"
						/>
					)}
					<h1 dangerouslySetInnerHTML={{ __html: post.titre.html }} />
					<p>{post?.description}</p>
					<small>
						publié le <time dateTime={post.date}>{dateCool(post.date)}</time>
						{!sameEditDate && (
							<span>
								, mis à jour{' '}
								<time dateTime={lastEdit}>{dateCool(lastEdit)}</time>
							</span>
						)}
					</small>
					{translation && (
						<Translation>
							{translation.lang === 'en' ? (
								<div>
									<Link href={translation.url} prefetch={false}>
										🇬🇧 &nbsp;This post is also available in English
									</Link>
								</div>
							) : (
								<div>
									<Link href={translation.url} prefetch={false}>
										🇫🇷 &nbsp;Cet article est aussi disponible en français
									</Link>
								</div>
							)}{' '}
						</Translation>
					)}

					{!post.sommaire && <hr />}
				</header>
				{post.sommaire && <Sommaire headings={post.headings} url={post.url} />}

				<MDXContent components={mdxComponents} />
				<Contribution slug={slug} />
				<OtherArticles excludeUrl={post.url} />
			</ArticleWrapper>
			{post?.bluesky && <BlueskyComments uri={post.bluesky} />}
		</div>
	)
}
