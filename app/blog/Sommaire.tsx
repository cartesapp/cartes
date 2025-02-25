import { styled } from 'next-yak'
import Link from 'next/link'

// Thanks https://yusuf.fyi/posts/contentlayer-table-of-contents
export default function Sommaire({ headings, url }) {
	return (
		<Wrapper>
			<ol>
				{headings.map((heading) => {
					return (
						<li key={`#${heading.slug}`}>
							<Link
								href={`${url}/#${heading.slug}`}
								style={{ paddingLeft: heading.level - 2 + 'rem' }}
							>
								{heading.text}
							</Link>
						</li>
					)
				})}
			</ol>
		</Wrapper>
	)
}

const Wrapper = styled.section`
	border: 1px solid var(--lightestColor);
	background: var(--lightestColor2);
	margin: 2rem auto 2rem 0rem;
	padding: 0.3rem 6rem 0.3rem 1.6rem;
	border-radius: 0.2rem;
	font-size: 90%;
	line-height: 1.4rem;
	width: fit-content;
	li {
		color: var(--darkColor);
	}
	a {
		color: var(--darkColor);
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}
`
