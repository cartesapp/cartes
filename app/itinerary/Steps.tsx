import useSetSearchParams from '@/components/useSetSearchParams'
import { replaceArrayIndex } from '@/components/utils/utils'
import addIcon from '@/public/add-circle-stroke.svg'
import closeIcon from '@/public/remove-circle-stroke.svg'
import { Reorder, useDragControls } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { removeStatePart } from '../SetDestination'
import { css, styled } from 'next-yak'
import { StepList } from '../itineraire/StepsUI'

export default function Steps({
	setState,
	state,
	setDisableDrag = () => null,
}) {
	console.log('lightgreen state', state)

	// We're displaying the steps selector with minimum 2 steps
	const steps =
		!state || state.length === 0
			? [null, null]
			: state.length === 1
			? [...state, null]
			: state

	const setSearchParams = useSetSearchParams()

	if (!steps?.length) return null

	const allez = steps.map((step) => step?.key).join('->')

	return (
		<section>
			<AddStepButton
				url={setSearchParams({ allez: '->' + allez }, true)}
				title={'Ajouter un point comme départ'}
			/>
			<StepList
				axis="y"
				values={steps.map((step) => step?.key)}
				onReorder={(newItems) =>
					setSearchParams({ allez: newItems.join('->') })
				}
			>
				{steps.map((step, index) => (
					<Item
						key={
							console.log('step key', step?.key || index) || step?.key || index
						}
						{...{
							index,
							step,
							setSearchParams,
							beingSearched: step?.stepBeingSearched,
							state,
							setState,
							setDisableDrag,
							allez,
						}}
					/>
				))}
			</StepList>
			<AddStepButton
				url={setSearchParams({ allez: allez + '->' }, true)}
				title={'Ajouter un point comme destination'}
			/>
		</section>
	)
}
const AddStepButtonWrapper = styled.div`
	z-index: 7;
	display: flex;
	align-items: center;
	justify-content: end;
	height: 0.55rem;
	margin-right: 1.8rem;
	img {
		width: 1.2rem;
		height: auto;
		vertical-align: sub;
		opacity: 0.4;
	}
`
const AddStepButton = ({ url, title, $between }) => (
	<AddStepButtonWrapper>
		<StepLink href={url} title={title} $between={$between}>
			<Image src={addIcon} alt="Supprimer cette étape" />
		</StepLink>
	</AddStepButtonWrapper>
)

const StepLink = styled(Link)`
	text-decoration: none;
	margin: 0rem 0.7rem;
	display: inline-block;
	${(p) =>
		p.$between
			? css`
					top: 1rem;
					position: absolute;
					right: 1.1rem;
					background: var(--lightestColor);
					border-radius: 1.8rem;
			  `
			: ''}
`
const Item = ({
	index,
	step,
	setSearchParams,
	beingSearched,
	state,
	setState,
	setDisableDrag,
	allez,
}) => {
	const controls = useDragControls()
	const [undoValue, setUndoValue] = useState(null)
	const key = step?.key
	const stepDefaultName =
		index == 0
			? 'une origine'
			: state.length === 0 || index === state.length - 1
			? 'une destination'
			: 'cette étape'
	return (
		<Reorder.Item
			key={key}
			value={key}
			dragListener={false}
			dragControls={controls}
			style={
				beingSearched
					? {
							background: 'yellow !important',
					  }
					: {}
			}
		>
			<ItemContent>
				<span
					onClick={() => {
						console.log('lightgreen allezpart', 'coucou')
						step && setUndoValue(step)
						setState(
							state.map((step, mapIndex) => ({
								...(step || {}),
								stepBeingSearched: mapIndex === index ? true : false,
							}))
						)
					}}
				>
					<StepIcon>{letterFromIndex(index)}</StepIcon>{' '}
					<StepName $hasName={!step || !step.name}>
						{beingSearched
							? `Choisissez ${stepDefaultName}`
							: step?.name || `Cliquez pour choisir ${stepDefaultName}`}
					</StepName>
				</span>
				{undoValue != null && beingSearched && (
					<span>
						{' '}
						<button
							onClick={() =>
								setState(replaceArrayIndex(state, index, undoValue))
							}
						>
							<Image
								src="/close.svg"
								width="10"
								height="10"
								alt="Icône croix"
							/>{' '}
							annuler
						</button>
					</span>
				)}
			</ItemContent>
			<ItemButtons>
				{index < state.length - 1 && (
					<AddStepButton
						url={setSearchParams({ allez: allez.replace('->', '->->') }, true)}
						title={'Ajouter un point intermédiaire'}
						$between={true}
					/>
				)}
				{key ? (
					<div
						onPointerDown={(e) => {
							setDisableDrag(true)
							controls.start(e)
						}}
						onPointerUp={(e) => {
							setDisableDrag(false)
						}}
						className="reorder-handle"
					>
						<Dots />
					</div>
				) : (
					<Placeholder />
				)}
				{index !== 0 && index !== state.length - 1 && (
					<RemoveStepLink {...{ setSearchParams, stepKey: key, state }} />
				)}
			</ItemButtons>
		</Reorder.Item>
	)
}

const Placeholder = styled.div`
	width: 1.6rem;
`

const RemoveStepLink = ({ setSearchParams, stepKey, state }) => {
	if (!stepKey) return null

	return (
		<RemoveStepLinkWrapper
			href={setSearchParams({ allez: removeStatePart(stepKey, state) }, true)}
		>
			<Image src={closeIcon} alt="Supprimer cette étape" />
		</RemoveStepLinkWrapper>
	)
}

const RemoveStepLinkWrapper = styled(Link)`
	position: absolute;
	right: -1.6rem;
	top: 0.15rem;
	background: var(--lightestColor);
	border-radius: 1rem;
	img {
		width: 1rem;
		height: auto;
		opacity: 0.6;
	}
`

export const StepIcon = styled.span`
	display: inline-block;
	margin: 0 0.4rem 0 0;
	background: var(--color);
	color: white;
	width: 1.4rem;
	text-align: center;
	height: 1.4rem;
	line-height: 1.4rem;
	border-radius: 2rem;
`

const Dots = () => (
	<span
		css={css`
			cursor: pointer;
			display: inline-flex;
			width: 1.4rem;
			height: 1.2rem;
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			span {
				display: block;
				background: var(--color);
				width: 5px;
				border-radius: 5px;
				height: 5px;
				margin: 1px;
			}
			opacity: 0.8;
		`}
	>
		{[...new Array(9)].map((_, index) => (
			<span key={index}></span>
		))}
	</span>
)

const StepName = styled.span`
	min-width: 6rem;
	cursor: text;
	${(p) =>
		p.$hasName
			? css`
					font-weight: 300;
					color: var(--darkColor);
					font-style: italic;
			  `
			: ''}
`

const ItemContent = styled.div`
	display: flex;
	justify-content: start;
	align-items: center;
	> span {
		line-height: 1.4rem;
	}
	button > img {
		margin-left: 0.4rem;
		filter: invert(1);
	}
`
const ItemButtons = styled.div`
	position: relative;
	&,
	a {
		display: flex;
		align-items: center;
	}
	> a {
		margin-right: 0.4rem;
	}
`

export const letterFromIndex = (index) => String.fromCharCode(65 + (index % 26))

export const getHasStepBeingSearched = (state) => {
	return state.some((step) => step && step.stepBeingSearched)
}
