import { allArticles } from '@/.contentlayer/generated'

export const blogArticles = allArticles.filter(
	(article) =>
		!article.tags?.includes('page') && !article.tags?.includes('brouillon')
)
