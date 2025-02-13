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
//import { getSlug, hasTranslation } from './blogArticles'
import Link from 'next/link'

export default async function Article({ post, slug }) {
	const MDXContent = getMDXComponent(post.body.code)

	const translation = null // hasTranslation(post)
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

					<hr />
				</header>
				<MDXContent components={mdxComponents} />
				<Contribution slug={slug} />
				<OtherArticles excludeUrl={post.url} />
			</ArticleWrapper>
			{post?.bluesky && <BlueskyComments uri={post.bluesky} />}
		</div>
	)
}
