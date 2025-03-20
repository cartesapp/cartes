import { styled } from 'next-yak'

export default function MapContent({ content }) {
	return (
		<Wrapper>
			<P>{content}</P>
		</Wrapper>
	)
}

const P = styled.p`
	margin-top: 1.6rem;
	font-size: 85%;
	color: var(--darkerColor);
	opacity: 0.8;
	line-height: 1rem;
`

const Wrapper = styled.section``
