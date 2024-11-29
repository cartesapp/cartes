 import {css} from 'next-yak'
 
 export default function CTA({ children, href = '/' }) {
 	return (
 		<a
 			href={href}
 			css={css`
 				text-decoration: none;
 				font-size: 160%;
 				background: linear-gradient(30deg, var(--color), var(--darkColor));
 				display: block;
 				margin: 4vh auto 6vh;
 				width: fit-content;
 				color: white;
 				padding: 1rem 2rem;
 				border-radius: 1rem;
 			`}
 		>
 			{children}
 		</a>
 	)
 }
