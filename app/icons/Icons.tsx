import Icon from '@/components/Icon'
import { styled } from 'next-yak'

export default function Icons({ tags }) {
	console.log('cyan tags', tags)
	const icons = typeof tags === 'string' ? [tags] : Object.entries(tags)
	if (typeof tags === 'string')
		return (
			<IconList>
				<Icon v={tags} k={null} />
			</IconList>
		)
	return (
		<IconList>
			{icons.map(([k, v]) => (
				<li key={k + '|' + v}>
					<Icon k={k} v={v} />
				</li>
			))}
		</IconList>
	)
}

const IconList = styled.ul`
	display: inline-flex;
	align-items: center;
	list-style-type: none;
	li {
		margin-right: 0.2rem;
	}
	li:last-child {
		margin-right: 0;
	}

	filter: invert(16%) sepia(24%) saturate(3004%) hue-rotate(180deg)
		brightness(89%) contrast(98%);
	img {
		width: 1.4rem;
		height: 1.4rem;
		filter: invert(1);
		vertical-align: sub;
	}
`
