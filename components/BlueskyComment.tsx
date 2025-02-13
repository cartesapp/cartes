import { dateCool } from '@/app/blog/utils'
import { styled } from 'next-yak'

export default function BlueskyComment({ data, i = 0 }) {
	console.log('comment0')
	const { text, createdAt } = data.post.record
	const { handle, displayName, avatar } = data.post.author
	const coolDate = dateCool(createdAt)
	console.log(
		'comment',
		i,
		handle,
		displayName,
		coolDate,
		text,
		data.replies.length
	)
	return (
		<Li>
			<section>
				<header>
					<img src={avatar} alt={`Image du compte ${handle}`} />
					<span>{displayName}</span>
					<small>le {coolDate}</small>
				</header>
				<div>{text}</div>
				<Replies replies={data.replies} i={i} />
			</section>
		</Li>
	)
}

const Replies = ({ replies, i }) => {
	if (replies && replies.length > 0)
		return (
			<ol>
				{replies.map((reply) => (
					<BlueskyComment key={reply.post.uri} data={reply} i={i + 1} />
				))}
			</ol>
		)
	return null
}

const Li = styled.li`
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
`
