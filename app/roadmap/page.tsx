import Page, { title, description } from './Page'

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		images: ['/blog-images/construction'],
		url: '/roadmap',
		modifiedTime: '2025-02-25T00:00:00.000ZT00:00:00.000Z',
		type: 'article',
	},
}

export default function () {
	return <Page />
}
