import { styled } from 'next-yak'

export default function MapContent({ content }) {
	return (
		<Wrapper>
			<P>{content}</P>
		</Wrapper>
	)
}

const P = styled.p`
	font-size: 85%;
	color: var(--darkerColor);
	opacity: 0.8;
	line-height: 1.2rem;
`

const Wrapper = styled.section``
