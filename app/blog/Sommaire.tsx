import { styled } from 'next-yak'
import Link from 'next/link'

// Thanks https://yusuf.fyi/posts/contentlayer-table-of-contents
export default function Sommaire({ headings, url }) {
	return (
		<Wrapper>
			{headings.map((heading) => {
				return (
					<div key={`#${heading.slug}`}>
						<Link
							href={`${url}/#${heading.slug}`}
							style={{ paddingLeft: heading.level - 2 + 'rem' }}
						>
							{heading.text}
						</Link>
					</div>
				)
			})}
		</Wrapper>
	)
}

const Wrapper = styled.section`
	border: 1px solid var(--lightestColor);
	background: var(--lightestColor2);
	margin: 1rem auto 2rem;
	padding: 0.3rem 0.6rem;
	border-radius: 0.2rem;
	font-size: 90%;
	line-height: 1.4rem;
	width: fit-content;
	a {
		color: var(--darkColor);
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}
`
