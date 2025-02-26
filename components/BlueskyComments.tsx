import BlueskyComment from '@/components/BlueskyComment'
import { AppBskyFeedDefs, AtpAgent } from '@atproto/api'
import { styled } from 'next-yak'
const agent = new AtpAgent({ service: 'https://public.api.bsky.app' })

export default async function BlueskyComments({ uri }) {
	const part = uri.split('app.bsky.feed.post/')[1]
	const url = `https://bsky.app/profile/cartes.app/post/${part}`

	if (!uri) return null
	let response
	try {
		response = await agent.getPostThread({ uri })
	} catch (e) {
		console.error('Error fetching bluesky comments', e)
		return null
	}

	const { data } = response
	const thread = data.thread

	if (!AppBskyFeedDefs.isThreadViewPost(data.thread)) {
		return <p className="text-center">Could not find thread</p>
	}

	const noReplies = !thread.replies || thread.replies.length === 0

	return (
		<Wrapper>
			<h2>Commentaires</h2>
			<p>
				Réagissez à <a href={url}>cet article</a> sur Bluesky.
			</p>
			{false && ( // this fails in Next production... not in local. I don't understand why
				<div>
					<p>Vos commentaires apparaitront ici :)</p>

					{noReplies ? null : (
						<ol>
							{thread.replies.map((data) => {
								return <BlueskyComment key={data.post.uri} data={data} />
							})}
						</ol>
					)}
				</div>
			)}
		</Wrapper>
	)
}

const Wrapper = styled.section`
	max-width: 700px;
	margin: 0 auto 2rem auto;
	padding: 0 1rem;
	ol {
		list-style-type: none;
	}
`
