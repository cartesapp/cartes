import Post from '@/app/blog/[slug]/page'

export default function About() {
	return <Post params={{ slug: 'a-propos' }} />
}
