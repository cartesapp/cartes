import { downloadIssues } from '@/lib/githubIssues'

export async function GET(request) {
	if (process.env.NODE_ENV === 'production')
		return new Response({ error: 'Unauthorized' })

	const issues = await downloadIssues()

	return new Response(JSON.stringify(issues))
}
