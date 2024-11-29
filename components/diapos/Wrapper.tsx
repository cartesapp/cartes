 'use client'
 
 import Link from 'next/link'
 import {styled} from 'next-yak'
 
 export const DiapoWrapper = styled.div`
 	color: var(--darkerColor);
 	font-size: 160%;
 	ul,
 	ol {
 		li {
 			margin: 1rem;
 		}
 	}
 	> section:not(:first-child) {
 		h2,
 		h3,
 		h4,
 		h5 {
 			position: absolute;
 			top: 4vh;
 		}
 	}
 	> section {
 		position: relative;
 		display: flex;
 		flex-direction: column;
 		align-items: center;
 		height: 100vh;
 		justify-content: center;
 
 		border-bottom: 1px solid var(--lightestColor);
 	}
 
 	h2,
 	h3,
 	h4,
 	h5 {
 	}
 
 	h2,
 	h3,
 	h4 {
 		font-size: 400%;
 		display: inline-block;
 		margin: 4rem 0;
 		line-height: 3rem;
 	}
 	h2 {
 		font-size: 220%;
 	}
 	h3 {
 		font-size: 180%;
 	}
 	h4 {
 		font-size: 160%;
 	}
 	h5 {
 		font-size: 140%;
 		margin: 2rem 0;
 	}
 	p {
 		margin: 0.8rem 0;
 	}
 	img,
 	video {
 		display: block;
 		max-width: 90vw;
 		max-height: 50vh;
 		margin: 1rem auto;
 		border-radius: 0.6rem;
 	}
 
 	aside {
 		width: 100%;
 		position: absolute;
 		bottom: 4vh;
 		left: 0;
 		color: #bbb;
 		text-align: center;
 		font-size: 80%;
 		display: block;
 		display: none;
 	}
 	em {
 		/* https://max.hn/thoughts/how-to-create-a-highlighter-marker-effect-in-css */
 		font-style: normal;
 		margin: 0 -0.1rem;
 		padding: 0.1em 0.4em;
 		border-radius: 0.8em 0.3em;
 		background: transparent;
 		background-image: linear-gradient(
 			to right,
 			rgba(87, 191, 245, 0.1),
 			rgba(87, 191, 245, 0.6) 4%,
 			rgba(87, 191, 245, 0.25)
 		);
 		-webkit-box-decoration-break: clone;
 		box-decoration-break: clone;
 		text-wrap: nowrap;
 	}
 	blockquote {
 		max-width: 80%;
 	}
 `
 
 export const ImageGrid = ({
 	images,
 	orientation = 'landscape',
 	wrap = 'nowrap',
 }) => {
 	return (
 		<ul
 			css={css`
 				max-height: 60vh;
 				display: flex;
 				flex-wrap: ${wrap};
 				justify-content: center;
 				padding: 0 5%;
 				list-style-type: none;
 				gap: 6%;
 				align-items: center;
 				li {
 					img {
 						${orientation === 'landscape'
 							? `
 						max-height: 30vh;
 						`
 							: `max-width: 20vw;`}
 						display: block;
 						object-fit: cover;
 					}
 				}
 			`}
 		>
 			{images.map((image) => (
 				<li key={image.img}>
 					<a href={image.url}>
 						<img src={image.img} />
 					</a>
 				</li>
 			))}
 		</ul>
 	)
 }
 
 export const Summary = ({ sections }) => (
 	<ol>
 		{sections.map(([label, hash]) => (
 			<li key={hash}>
 				<Link href={hash}>{label}</Link>{' '}
 			</li>
 		))}
 	</ol>
 )
