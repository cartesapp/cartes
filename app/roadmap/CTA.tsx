import { styled } from 'next-yak'

export default function CTA({ children, href = '/' }) {
	return <A href={href}>{children}</A>
}

const A = styled.a`
	text-decoration: none;
	font-size: 160%;
	background: linear-gradient(30deg, var(--color), var(--darkColor));
	display: block;
	margin: 4vh auto 6vh;
	width: fit-content;
	color: white;
	padding: 1rem 2rem;
	border-radius: 1rem;
`
