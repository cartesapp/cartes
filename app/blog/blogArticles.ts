import articles from '@/.contentlayer/generated/Article/_index.json'

export const allArticles = articles
export const blogArticles = articles.filter(
	(article) =>
		!article.tags?.includes('page') &&
		!article.tags?.includes('brouillon') &&
		!article.original
)

export const getSlug = (article) => article._raw.flattenedPath
export const hasTranslation = (article0) =>
	articles.find(
		(article1) =>
			getSlug(article0) === article1.original ||
			getSlug(article1) === article0.original
	)
