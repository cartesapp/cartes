// Inspired by https://github.com/zbycz/osmapp/blob/master/src/services/helpers.ts#L107

import { css, styled } from 'next-yak'
import { buildAddress } from './osm/buildAddress'

export const addressKeys = [
	'addr:place',
	'addr:street',
	'addr:housenumber',
	'addr:city',
	'addr:state',
	'addr:postcode',
	'contact:city',
	'contact:housenumber',
	'contact:postcode',
	'contact:street',
]

export default function Address({ tags, noPrefix }) {
	return <AddressElement>{buildAddress(tags, noPrefix)}</AddressElement>
}
const AddressElement = styled.address`
	line-height: 1.4rem;
	font-size: 90%;
	font-style: normal;
`

export const AddressDisc = ({ t, noPrefix = false }) => {
	const g = (key) => {
		const value = noPrefix ? t[key] : t[`addr:` + key] || t['contact:' + key]
		if (value == null) return ''
		const shorterValue = [
			['avenue', 'av.'],
			['boulevard', 'bd.'],
			['rue', 'r.'],
			['carrefour', 'car.'],
		].reduce((memo, [from, to]) => memo.replace(from, to), value.toLowerCase())
		return shorterValue || ''
	}
	return (
		<AddressDiscContainer>
			<strong>{g('housenumber')}</strong>
			<span>{g('street')}</span>
		</AddressDiscContainer>
	)
}

export const AddressDiscContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0.6rem 0;
	justify-content: space-between;
	width: 4rem;
	height: 4rem;
	border-radius: 4rem;
	background: var(--darkColor);
	color: white;
	font-size: 80%;
	overflow: hidden;
	> span,
	> strong {
		text-align: center;
		line-height: 0.9rem;
		max-width: 4rem;
	}
	img {
		filter: invert(0) !important;
	}
`
