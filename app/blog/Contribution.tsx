 import {css} from 'next-yak'
 import Link from 'next/link'
 
 export default function Contribution({ slug }) {
 	return (
 		<Link
 			href={`https://github.com/cartesapp/cartes/edit/master/articles/${slug}.mdx`}
 			css={css`
 				display: block;
 				margin: 0 0 0 auto;
 				width: fit-content;
 				margin-top: 2rem;
 			`}
 		>
 			✏️ Signaler une erreur
 		</Link>
 	)
 }
