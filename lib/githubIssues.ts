import { Octokit } from '@octokit/rest'
import { writeFileSync } from 'fs'
import { convertIssueLinksToInternal } from '@/app/documentation/tickets/[number]/page'
import { micromark } from 'micromark'
import { gfm, gfmHtml } from 'micromark-extension-gfm'

const octokit = new Octokit({ auth: process.env.GITHUB_CLASSIC_TOKEN })

// Credits :
// https://notebook.lachlanjc.com/2022-08-18_set_up_rss_with_contentlayer_and_mdx
//

export async function downloadIssues() {
	console.log('🐙 will download github issues and store them in public/')
	const response = await octokit.paginate('GET /repos/{owner}/{repo}/issues', {
		owner: 'cartesapp',
		repo: 'cartes',
		per_page: 100,
		headers: {
			'X-GitHub-Api-Version': '2022-11-28',
		},
	})

	const withMarkdown = response
		.map((issue) => {
			const { body } = issue

			if (!body) return issue
			const markdownBody = convertIssueLinksToInternal(
				micromark(issue.body, {
					extensions: [gfm()],
					htmlExtensions: [gfmHtml()],
				})
			)

			return {
				...issue,
				markdownBody,
			}
		})
		.filter(Boolean)

	writeFileSync('./public/github-issues.json', JSON.stringify(withMarkdown))
	console.log('💡 Github issues written in ./public/')

	return withMarkdown
}

//downloadIssues()
