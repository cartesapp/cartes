'use client'

import { getFetchUrlBase } from '@/app/serverUrls'
import list from '@/public/github-issues.json'
import { styled } from 'next-yak'
import { useEffect, useState } from 'react'

export default function NextSteps({ issues }) {
	const [comments, setComments] = useState({})

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
				effort: computeEffort(issue.title, issue.body, issueComments),
				enTitle: extractEnglishTitle(issue),
			}
		}
	)

	return (
		<Wrapper>
			<ol>
				{results.map((issue) => (
					<li key={issue.number}>
						<a href={issue.html_url} target="_blank">
							<small>{issue.enTitle || issue.title}</small>
						</a>{' '}
						<div style={{ textAlign: 'right' }}>🧑‍💻 {issue.effort}</div>
					</li>
				))}
			</ol>
		</Wrapper>
	)
}

const Wrapper = styled.section`
	overflow: hidden;
	width: 50rem;
	max-width: 90vw;
	margin: 0;
	ol {
		white-space: nowrap;
		height: 7rem;
		display: flex;
		align-items: center;
		overflow: scroll;
		list-style-type: none;
		padding-left: 0;

		li {
			background: white;
			height: 5rem;
			width: 12rem;
			min-width: 14rem;
			margin: 0 0.6rem;
			padding: 0.3rem 0.8rem;
			border: 1px solid var(--lighterColor);
			border-radius: 0.4rem;
			white-space: wrap;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			small {
				font-size: 90%;
			}
		}
	}
`

const extractEnglishTitle = (issue) => {
	const { body } = issue

	const found = body.match(/🇬🇧\s(.+)\s🇬🇧/)
	if (found) return found[1]
}

// Regular expression to match the watch symbol followed by a number
const watchRegex = /⌚️(\d+(\.\d+)?)/g
const computeEffort = (title, body, comments) => {
	const efforts = [{ body }, ...comments]
		.map((comment) => {
			const match = comment.body.match(watchRegex)
			console.log('super', title, match, comment.body)
			return match
				? match
						.flatMap((match) => parseFloat(match.replace('⌚️', '')))
						.reduce((acc, value) => acc + value, 0)
				: 0
		})
		.filter(Boolean)
	//.map((match) => +match[1])

	const totalEffort = efforts.reduce((memo, next) => next + memo, 0)
	return totalEffort
}
