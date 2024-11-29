 import { compareDesc } from 'date-fns'
 import { blogArticles } from './blogArticles'
 import Blog from './Blog'
 
 const title = `Le blog - Cartes`
 
 export const metadata: metadata = {
 	title,
 	description: 'yoyo',
 }
 
 const Page = () => {
 	const articles = blogArticles.sort((a, b) =>
 		compareDesc(new Date(a.date), new Date(b.date))
 	)
 	return <Blog articles={articles} />
 }
 
 export default Page
