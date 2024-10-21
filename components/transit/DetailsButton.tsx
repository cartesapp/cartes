import Link from 'next/link'

export default function DetailsButton({ link }) {
	return (
		<Link
			href={link}
			onClick={(e) => {
				e.stopPropagation()
			}}
		>
			🎯
		</Link>
	)
}
