import news from '@/components/news/news.yaml'
import { remark } from 'remark'
import html from 'remark-html'

export async function GET() {
	const result = await Promise.all(
		news.map(async (item) => ({
			...item,
			descriptionMdx: await toHtml(item.description),
		}))
	)
	return Response.json(result)
}

const toHtml = async (markdown) => {
	const processedContent = await remark().use(html).process(markdown)

	const contentHtml = processedContent.toString()
	return contentHtml
}
