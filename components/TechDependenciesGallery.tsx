import dependencies from '@/components/dependencies.yaml'
import { styled } from 'next-yak'

export default function TechDependenciesGallery({ additionalCss }) {
	return (
		<Ul $additionalCss={additionalCss}>
			{dependencies.map(({ img, url, text }) => (
				<li key={url}>
					<a href={'https://' + url} target="_blank">
						<img src={img} alt={text} />
						<span>{text}</span>
					</a>
				</li>
			))}
		</Ul>
	)
}

const Ul = styled.ul`
	max-height: 90%;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
	padding: 0 5%;
	list-style-type: none;
	gap: 1vw;
	max-width: 72vw;

	li a {
		text-decoration: none;
		img {
			height: 5vh;
			width: auto;
			display: block;
			object-fit: cover;
		}
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	${(p) => p.$additionalCss}
`
