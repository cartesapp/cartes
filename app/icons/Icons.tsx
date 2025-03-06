'use client'
import useIcons from '@/app/effects/useIcons'
import Icon from '@/components/Icon'
import { styled } from 'next-yak'

export default function Icons({ tags }) {
	const icons = useIcons()
	console.log('cyan tags', tags)
	if (typeof tags === 'string')
		return (
			<IconList>
				<Icon v={tags} k={null} icons={icons} />
			</IconList>
		)
	return (
		<IconList>
			{Object.entries(tags).map(([k, v]) => (
				<li key={k + '|' + v}>
					<Icon k={k} v={v} icons={icons} />
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
