import { allArticles } from '../blogArticles'
import { getLastEdit } from '../utils'
import Article from '../Article'

export const generateMetadata = async (props) => {
	const params = await props.params
	const post = allArticles.find(
		(post) => post._raw.flattenedPath === params.slug
	)
	if (!post) return null
	const lastEdit = await getLastEdit(params.slug)
	return {
		title: post.titre.raw,
		description: post.description,
		openGraph: {
			images: post.image && [post.image],
			type: 'article',
			publishedTime: post.date + 'T00:00:00.000Z',
			modifiedTime: lastEdit + 'T00:00:00.000Z',
			url: '/blog/' + params.slug,
		},
	}
}

export default async function Post(props: Props) {
	const params = await props.params
	const { lang } = await props.searchParams

	const post = allArticles.find(
		(post) => post._raw.flattenedPath === params.slug
	)

	if (!post) return null

	return <Article post={post} slug={params.slug} />
}
