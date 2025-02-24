'use client'

import { getFetchUrlBase } from '@/app/serverUrls'
import list from '@/public/github-issues.json'
import { styled } from 'next-yak'
import { useEffect, useState } from 'react'

export default function NextSteps({ issues: givenIssues }) {
	const [comments, setComments] = useState({})
	const issues = Array.isArray(givenIssues) ? givenIssues : [+givenIssues]

	const selected = list.filter((issue) => issues.includes(issue.number))
	console.log('indigo2', selected.length, issues.length)

	useEffect(() => {
		const doFetch = async () => {
			const commentEntries = await Promise.all(
				selected.map(async ({ number, title, html_url, body }) => {
					try {
						const url =
							getFetchUrlBase() +
							'/api/fetch-github-issue-comments/?number=' +
							number
						const request = await fetch(url, {
							headers: {
								Authorization: `Bearer ${process.env.GITHUB_CLASSIC_TOKEN}`,
							},
						})

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
	}, [selected.map((issue) => issue.number).join('-'), setComments])

	if (selected.length !== issues.length) return 'Au moins un ticket non trouvé'

	console.log('indigo', comments)

	const results = Object.entries(comments).map(
		([issueNumber, issueComments]) => {
			const issue = list.find((issue) => issue.number == issueNumber)
			return {
				...issue,
				comments: issueComments,
				effort: computeEffort(issue.body, issueComments),
			}
		}
	)

	return (
		<Wrapper>
			{results.map((issue) => (
				<div key={issue.number}>
					<a href={issue.html_url} target="_blank">
						{issue.title}
					</a>{' '}
					🧑‍💻 {issue.effort}
				</div>
			))}
		</Wrapper>
	)
}

const Wrapper = styled.section`
	border: 1px solid red;
	display: flex;
	flex-direction: column;
`

const computeEffort = (body, comments) => {
	const efforts = [{ body }, ...comments]
		.map((comment) => comment.body.match(/⌚️(\d+(\.\d)?)/))
		.filter(Boolean)
		.map((match) => +match[1])

	const totalEffort = efforts.reduce((memo, next) => next + memo, 0)
	return totalEffort
}
