'use client'
import styled from 'styled-components'

const Article = styled.article`
	max-width: 700px;
	margin: 0 auto;
	padding: 0 1rem;
	padding-bottom: 10vh;
	header {
		margin-bottom: 2rem;
	}
	h1 {
		font-size: 240%;
		margin-bottom: 1rem;
		line-height: 2.2rem;
		text-align: center;
	}
	header > small {
		display: block;
		text-align: center;
		color: var(--color);
	}
	header > img {
		width: 30rem;
		max-width: 80%;
		height: auto;
		border-radius: 1rem;
		box-shadow: 0.3px 0.5px 0.7px hsl(0deg 0% 63% / 0.36),
			0.8px 1.6px 2px -0.8px hsl(0deg 0% 63% / 0.36),
			2.1px 4.1px 5.2px -1.7px hsl(0deg 0% 63% / 0.36),
			5px 10px 12.6px -2.5px hsl(0deg 0% 63% / 0.36);
	}
	h2 {
		font-size: 120%;
		font-weight: 600;
		line-height: 1.6rem;
		margin-top: 2rem;
	}
	img,
	video {
		max-width: 90%;
		max-height: 30rem;
		display: block;
		margin: 4vh auto;
		position: relative !important;
	}

	@media (max-width: 800px) {
		img {
			width: 100vw !important;
			max-width: initial !important;
			margin-left: -1rem;
			border-radius: 0 !important;
			box-shadow: none !important;
			margin-right: -1rem;
		}
	}
	img + em,
	.image-container + em,
	video + p em {
		font-size: 90%;
		line-height: 1rem;
		text-align: center;
		max-width: 70%;
		margin: 0 auto;
		display: block;
		margin-bottom: 1.8rem;
		@media (max-width: 800px) {
			line-height: 1.3rem;
		}
	}
	blockquote {
		margin-left: 0;
		padding-left: 1.4rem;
		border-left: 6px solid var(--color1);
	}
	ul {
		padding-left: 1rem;
	}
	#sommaire + ul {
		background: var(--darkestColor);
		padding: 0.6rem 2rem;
		border-radius: 1rem;
	}
	hr {
		opacity: 0.25;
		margin: 1.6rem 0;
		border: 1px solid var(--lightColor);
	}
	iframe {
		width: 90%;
		margin: 1.4rem auto;
		display: block;
		border: none;
		border-radius: 0.4rem;
	}
	del  {
		text-decoration-thickness: 3px;
		text-decoration-color: var(--lightColor);
		text-decoration-style: wavy;
	}
`

export default Article
