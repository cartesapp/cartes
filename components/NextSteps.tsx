'use client'

import list from '@/public/github-issues.json'
import { useEffect, useState } from 'react'

export default function NextSteps({ issues: givenIssues }) {
	const [comments, setComments] = useState({})
	const issues = Array.isArray(givenIssues) ? givenIssues : [+givenIssues]

	const selected = list.filter((issue) => issues.includes(issue.number))
	console.log('indigo2', selected.length)

	useEffect(() => {
		const doFetch = async () => {
			const commentEntries = await Promise.all(
				selected.map(async ({ number, title, html_url, body }) => {
					try {
						return
						const url = `https://api.github.com/repos/cartesapp/cartes/issues/${number}/comments`
						const request = await fetch(url)

						const json = await request.json()
						return [number, json]
					} catch (e) {
						return
					}
				})
			)

			setComments(Object.fromEntries(commentEntries))
		}

		doFetch()
	}, [selected, setComments])

	if (selected.length !== issues.length) return 'Au moins un ticket non trouvé'

	console.log('indigo', comments)

	return
	return <div>{issue['title']}</div>
}
