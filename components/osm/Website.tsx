import { styled } from 'next-yak'

export default function Website({ website }) {
	if (!website) return null
	const domain = website
		.replace(/https?:\/\//, '')
		.replace('www.', '')
		.split('/')[0]
	return (
		<Wrapper>
			<span style={{ fontSize: '120%', filter: 'grayscale(1)' }}>🌍️</span>
			<a
				href={website.startsWith('http') ? website : 'https://' + website}
				target="_blank"
				title="Site Web du lieu"
			>
				<span>{domain}</span>
			</a>
		</Wrapper>
	)
}

const Wrapper = styled.section`
	display: flex;
	align-items: center;
	gap: 0.4rem;
`
