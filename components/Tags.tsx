import Icons from '@/app/icons/Icons'
import { isHeritageTag } from '@/app/osm/Heritage'
import {
	getTagLabels,
	tagNameCorrespondance,
	tagValueCorrespondance,
} from '@/app/osmTagLabels'
import { styled } from 'next-yak'

const beginningsOfSecondaryTags = ['source', 'fixme:', 'note', 'ref:']

const isSecondary = ([k, v]) =>
	beginningsOfSecondaryTags.some((begining) => k.startsWith(begining))

const TagList = styled.ul`
	margin-top: 0.6rem;
	padding-left: 0.6rem;
	list-style-type: none;
	border-left: 4px solid var(--lightColor);
	line-height: 1.4rem;
	img {
		opacity: 0.7;
	}
	display: flex;
	flex-direction: column;
`
export default function Tags({ tags }) {
	return (
		<TagList>
			{tags.map(([raw, [k, v]], i) => (
				<li
					key={k + v}
					style={
						isSecondary(Object.entries(raw)[0])
							? { fontSize: '80%', order: 1000 + i }
							: {}
					}
				>
					<Icons tags={raw} />
					<span>
						<span>{tagNameCorrespondance(k)}</span> :{' '}
						<span>{tagValueCorrespondance(v)}</span>
					</span>
				</li>
			))}
		</TagList>
	)
}
const isFrenchAdministration = (tags) =>
	tags['ref:FR:SIREN'] || tags['ref:INSEE'] // this is an attempt, edge cases can exist

export const getFrenchAdminLevel = (tags, adminLevel) =>
	isFrenchAdministration(tags) &&
	{
		3: 'Outre-mer français',
		4: 'Région française',
		5: 'Circonscription départementale',
		6: 'Département',
		7: 'Arrondissement départemental',
		8: 'Commune',
		9: 'Arrondissement municipal',
		10: 'Quartier',
	}[adminLevel]

export const processTags = (filteredRest) => {
	const translatedTags = Object.entries(filteredRest)
			// Tags to exclude because handled by other components that provide a test function
			.filter(([k, v]) => !isHeritageTag(k))
			.map(([key, value]) => {
				const tagLabels = getTagLabels(key, value)
				return [{ [key]: value }, tagLabels]
			}),
		keyValueTags = translatedTags.filter(([, t]) => t.length === 2),
		soloTags = translatedTags.filter(([, t]) => t.length === 1)

	return [keyValueTags, soloTags]
}

export function SoloTags({ tags, iconsOnly, compact }) {
	return (
		<SoloTagsUl $compact={compact}>
			{tags.map(([raw, tag]) => (
				<li key={tag}>
					<Icons tags={raw} />
					{!iconsOnly && <span>{tag}</span>}
				</li>
			))}
		</SoloTagsUl>
	)
}

const SoloTagsUl = styled.ul`
	list-style-type: none;
	display: flex;
	align-items: center;
	> li {
		margin-right: ${(p) => (p.$compact ? '0' : '0.6rem')};
		display: flex;
		align-items: center;
	}
	overflow: scroll;
	white-space: nowrap;
	margin-bottom: 0.2rem;
	scrollbar-width: none;
	&::-webkit-scrollbar {
		width: 0px;
		background: transparent; /* Disable scrollbar Chrome/Safari/Webkit */
	}
	opacity: 0.7;
	> li > span {
		line-height: 1.4rem;
	}
`
