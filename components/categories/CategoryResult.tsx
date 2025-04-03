import { computeHumanDistance } from '@/app/RouteRésumé'
import { buildAllezPartFromOsmFeature } from '@/app/SetDestination'
import categoryGroupColors from '@/app/categoryGroupColors.yaml'
import { OpenIndicator, getOh } from '@/app/osm/OpeningHours'
import { styled } from 'next-yak'
import Image from 'next/image'
import Link from 'next/link'
import { computeRoseDirection } from '../SimilarNodes'
import { capitalise0 } from '../utils/utils'

export default function CategoryResult({
	result,
	setSearchParams,
	annuaireMode,
}) {
	const {
		tags: { name: rawName, description, opening_hours: oh },
		category,
		distance,
		bearing,
	} = result

	const name = rawName || capitalise0(category.name) + ' sans nom'

	const allez = buildAllezPartFromOsmFeature(result)
	const url = annuaireMode
		? `/lieu?allez=${allez}`
		: setSearchParams(
				{
					allez,
				},
				true
		  )

	const humanDistance = computeHumanDistance(distance * 1000)
	const { isOpen } = oh ? getOh(oh) : {}
	const isOpenByDefault = category['open by default']
	const roseDirection = computeRoseDirection(bearing)
	return (
		<ResultLinkWrapper href={url}>
			<header>
				<div>
					<ImageWrapper $background={categoryGroupColors[category.group]}>
						<Image
							src={
								category.icon.startsWith('http')
									? category.icon
									: '/icons/' + category.icon + '.svg'
							}
							width="10"
							height="10"
							alt={'Icône pour la catégorie ' + category.name}
						/>{' '}
					</ImageWrapper>
					<h2>{name}</h2>
				</div>
				{!isOpenByDefault &&
					(oh == null ? (
						<NoOpenIndicator />
					) : (
						<OpenIndicator isOpen={isOpen === 'error' ? false : isOpen} />
					))}
			</header>
			{description && <p>{description}</p>}
			<small
				style={{
					textAlign: 'right',
				}}
			>
				à {humanDistance[0]} {humanDistance[1]}{' '}
				{annuaireMode ? 'du centre ' : ''}vers {roseDirection}
			</small>
		</ResultLinkWrapper>
	)
}

const NoOpenIndicator = styled.span`
	display: inline-block;
	width: 1.8rem;
`
const ImageWrapper = styled.div`
	background: ${(p) => p.$background};
	border-radius: 2rem;
	width: 1.6rem;
	height: 1.6rem;
	display: flex;
	align-items: center;
	justify-content: center;
	img {
		width: 1rem;
		height: auto;
		filter: invert(1);
	}
`

const ResultLinkWrapper = styled(Link)`
	text-decoration: none;
	color: inherit;
	display: block;
	border-radius: 0.3rem;
	background: white;
	margin: 0.4rem 0;
	padding: 0.6rem 0.6rem;
	header {
		h2 {
			margin: 0;
			margin-left: 0.4rem;
			font-weight: bold;
			font-size: 90%;
			line-height: 1.6rem;
		}
	}
	header {
		display: flex;
		justify-content: space-between;
		> div {
			display: flex;
			align-items: center;
		}
	}
`
