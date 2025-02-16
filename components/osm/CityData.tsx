import { styled } from 'next-yak'

export default function CityData(data) {
	if (!Object.keys(data).length) return null
	const {
		population,
		populationDate,
		postalCode,
		populationSource,
		inseeCode,
	} = data

	return (
		<Wrapper>
			{population && (
				<div>
					<span>Population :</span> {formatter(population)} hab.{' '}
					<small>
						{populationDate && <span>en {populationDate}</span>}
						{populationSource && <span> source {populationSource}</span>}
					</small>
				</div>
			)}
			{postalCode && (
				<div>
					<span>Code postal :</span> {postalCode}
				</div>
			)}
			{inseeCode && (
				<div>
					<span>Code INSEE :</span> {inseeCode}
				</div>
			)}
		</Wrapper>
	)
}

const Wrapper = styled.section`
	display: flex;
	flex-direction: column;
	div {
		line-height: 1.4rem;
	}
	small {
		color: gray;
	}
`

const formatter = (number) => new Intl.NumberFormat('fr-FR').format(number)
