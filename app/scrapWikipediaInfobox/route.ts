import { extractFileName } from '@/components/wikidata'
import { JSDOM } from 'jsdom'

/* This should help us reduce the time taken by this function and our servers'
 * load, but the account creation is now working as of 16 feb 2025...
 * https://enterprise.wikimedia.com/docs/on-demand/#article-structured-contents-beta
 *
 * */
export async function GET(request) {
	const requestUrl = new URL(request.url),
		url = requestUrl.searchParams.get('url')
	const response = await fetch(decodeURIComponent('https://' + url))
	const html = await response.text()

	// Create a DOM element to parse the HTML
	const doc = new JSDOM(html).window.document

	// Find the og:image meta tag's content using querySelector
	const infobox = doc.querySelectorAll(
		'table.infobox tr:nth-of-type(2) a.mw-file-description'
	)

	const result = [...infobox].map((el) => el.getAttribute('href'))

	return Response.json(
		result.map((src) => {
			const prefixedFilename = src.split('/wiki/')[1]
			return extractFileName(prefixedFilename)
		})
	)
}
