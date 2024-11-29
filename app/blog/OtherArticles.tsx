 import {css} from 'next-yak'
 import { sortBy } from '@/components/utils/utils'
 import Link from 'next/link'
 import { OtherArticlesList, OtherArticlesSection } from './UI'
 import { blogArticles } from './page'
 import { dateCool } from './utils'
 
 export default function ({ excludeUrl }) {
 	return (
 		<OtherArticlesSection>
 			<h2>Nos derniers articles</h2>
 			<OtherArticlesList>
 				<ol>
 					{sortBy((article) => article.date)(blogArticles)
 						.reverse()
 						.filter(({ url }) => url !== excludeUrl)
 						.map(({ url, titre, date }) => (
 							<li key={url}>
 								<div>
 									<Link href={url}>
 										<h3 dangerouslySetInnerHTML={{ __html: titre.html }} />
 									</Link>
 								</div>
 								<small
 									css={css`
 										color: var(--color);
 										font-size: 90%;
 									`}
 								>
 									Publié le {dateCool(date)}
 								</small>
 							</li>
 						))}
 				</ol>
 			</OtherArticlesList>
 		</OtherArticlesSection>
 	)
 }
