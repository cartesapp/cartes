// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer2/source-files'
import mdxOptions from './mdxOptions.mjs'
import GithubSlugger from 'github-slugger'

export const Article = defineDocumentType(() => ({
	name: 'Article',
	filePathPattern: `**/*.mdx`,
	contentType: 'mdx',

	fields: {
		titre: { type: 'markdown', required: true },
		date: { type: 'date', required: true },
		description: { type: 'string', required: true },
		image: { type: 'string', required: false },
		original: { type: 'string', required: false },
		tags: { type: 'list', of: { type: 'string' }, required: false },
		bluesky: { type: 'string', required: false },
		lang: { type: 'string', required: false },
		sommaire: {
			type: 'boolean',
			required: false,
			default: false,
		},
	},
	computedFields: {
		url: {
			type: 'string',
			resolve: (post) => `/blog/${post._raw.flattenedPath}`,
		},
		// thanks https://yusuf.fyi/posts/contentlayer-table-of-contents
		headings: {
			type: 'json',
			resolve: async (doc) => {
				const regXHeader = /\n(?<flag>#{1,6})\s+(?<content>.+)/g
				const slugger = new GithubSlugger()
				const headings = Array.from(doc.body.raw.matchAll(regXHeader)).map(
					({ groups }) => {
						const flag = groups?.flag
						const content = groups?.content
						return {
							level: flag?.length,
							text: content,
							slug: content ? slugger.slug(content) : undefined,
						}
					}
				)
				return headings
			},
		},
	},
}))

export default makeSource({
	contentDirPath: 'articles',
	documentTypes: [Article],
	mdx: mdxOptions,
})
