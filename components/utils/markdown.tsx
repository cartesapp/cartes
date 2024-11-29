 import { MDXRemote } from 'next-mdx-remote/rsc'
 import mdxOptions from '@/mdxOptions'
 
 export const Markdown = ({ children }) => (
 	<MDXRemote source={children} options={mdxOptions}></MDXRemote>
 )
