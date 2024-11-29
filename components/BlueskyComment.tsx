 'use client'
 
 import { dateCool } from '@/app/blog/utils'
 
 export default function Comment({ data }) {
 	console.log('lightgreen', data)
 	const { text, createdAt } = data.post.record
 	const { handle, displayName, avatar } = data.post.author
 	const coolDate = dateCool(createdAt)
 	return (
 		<li
 			css={css`
 				list-style-type: none;
 				background: linear-gradient(to bottom, var(--color), transparent);
 				padding-left: 1px;
 				margin-top: 0.2rem;
 				margin-left: 0.6rem;
 				> section {
 					background: white;
 					padding-left: 0.5rem;
 					header {
 						display: flex;
 						align-items: center;
 						img {
 							width: 1rem;
 							height: auto;
 							margin-right: 0.4rem;
 						}
 						small {
 							margin-left: 0.4rem;
 							color: gray;
 						}
 					}
 					> div {
 						font-size: 90%;
 						line-height: 1.4rem;
 						max-width: 30rem;
 					}
 					margin-bottom: 1rem;
 				}
 			`}
 		>
 			{' '}
 			<section>
 				<header>
 					<img src={avatar} alt={`Image du compte ${handle}`} />
 					<span>{displayName}</span>
 					<small>le {coolDate}</small>
 				</header>
 				<div>{text}</div>
 				{data.replies && data.replies.length > 0 && (
 					<ol>
 						{data.replies.map((reply) => (
 							<Comment key={reply.post.uri} data={reply} />
 						))}
 					</ol>
 				)}
 			</section>
 		</li>
 	)
 
 	/*
 	const response = await agent.getPostThread({ uri: data.post.uri })
 	const { data } = response
 	const thread = data.thread
 
 	if (!AppBskyFeedDefs.isThreadViewPost(data.thread)) {
 		return <p className="text-center">Could not find thread</p>
 	}
 	*/
 }
