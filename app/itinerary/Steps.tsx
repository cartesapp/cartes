import useSetSearchParams from '@/components/useSetSearchParams'
import { replaceArrayIndex } from '@/components/utils/utils'
import addIcon from '@/public/add-circle-stroke.svg'
import closeIcon from '@/public/remove-circle-stroke.svg'
import { Reorder, useDragControls } from 'motion/react'
import { css, styled } from 'next-yak'
import Image from 'next/image'
import { useState } from 'react'
import { removeStatePart } from '../SetDestination'
import { StepList } from '../itineraire/StepsUI'
import { useMediaQuery } from 'usehooks-ts'

export default function Steps({
	setState,
	state,
	setDisableDrag = () => null,
}) {
	//	console.log('lightgreen state', state)

	// We're displaying the steps selector with minimum 2 steps
	const steps =
		!state || state.length === 0
			? [null, null]
			: state.length === 1
			? [...state, null]
			: state

	const setSearchParams = useSetSearchParams()

	if (!steps?.length) return null

	const allez = steps.map((step) => step?.allezValue).join('->')

	return (
		<section>
			<AddStepButton
				onClick={() => setSearchParams({ allez: '->' + allez })}
				title={'Ajouter un point comme départ'}
			/>
			<StepList
				axis="y"
				values={steps.map((step) => step?.allezValue)}
				onReorder={(newItems) =>
					setSearchParams({ allez: newItems.join('->') })
				}
			>
				{steps.map((step, index) => (
					<Item
						key={
							console.log('step key', step?.allezValue || index) ||
							step?.allezValue ||
							index
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
				onClick={() => setSearchParams({ allez: allez + '->' })}
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
const AddStepButton = ({ onClick, title, $between }) => (
	<AddStepButtonWrapper>
		<StepLink onClick={onClick} title={title} $between={$between}>
			<Image src={addIcon} alt="Supprimer cette étape" />
		</StepLink>
	</AddStepButtonWrapper>
)

const StepLink = styled.button`
	text-decoration: none;
	margin: 0rem 0.7rem;
	display: inline-block;
	padding: 0;
	${(p) =>
		p.$between
			? css`
					top: 0.7rem;
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
	console.log('lightgreen allez state', state)
	const controls = useDragControls()
	const [undoValue, setUndoValue] = useState(null)
	const isMobile = useMediaQuery('(max-width: 800px)')
	const allezValue = step?.allezValue
	const stepDefaultName =
		index == 0
			? 'une origine'
			: state.length === 0 || index === state.length - 1
			? 'une destination'
			: 'cette étape'
	return (
		<Reorder.Item
			key={allezValue}
			value={allezValue}
			dragListener={false}
			dragControls={controls}
			style={
				beingSearched
					? {
							background: 'yellow',
					  }
					: {}
			}
		>
			<ItemContent>
				<span
					onClick={() => {
						step && setUndoValue(step)
						// when in base itinerary mode without steps added by the user, we
						// need to initialize the itinerary with a state of more than 1 step
						const itineraryState =
							state.length === 1
								? index === 0
									? [...state, {}]
									: [{}, ...state]
								: state

						const newState = itineraryState.map((step, mapIndex) => ({
							...(step || {}),
							stepBeingSearched: mapIndex === index ? true : false,
						}))

						console.log('lightgreen allezpart', state, newState, index)
						setState(newState)
					}}
				>
					<StepIcon>{letterFromIndex(index)}</StepIcon>{' '}
					<StepName $hasName={!step || !step.name}>
						{beingSearched
							? isMobile
								? stepDefaultName
								: `Choisissez ${stepDefaultName}`
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
						onClick={() =>
							setSearchParams({ allez: allez.replace('->', '->->') })
						}
						title={'Ajouter un point intermédiaire'}
						$between={true}
					/>
				)}
				{allezValue ? (
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
					<RemoveStepLink {...{ setSearchParams, allezValue, state }} />
				)}
			</ItemButtons>
		</Reorder.Item>
	)
}

const Placeholder = styled.div`
	width: 1.6rem;
`

const RemoveStepLink = ({ setSearchParams, allezValue, state }) => {
	//	if (!allezValue) return null // Empty steps should be possible to remove

	return (
		<RemoveStepLinkWrapper
			onClick={() =>
				setSearchParams({ allez: removeStatePart(allezValue, state) })
			}
		>
			<Image src={closeIcon} alt="Supprimer cette étape" />
		</RemoveStepLinkWrapper>
	)
}

const RemoveStepLinkWrapper = styled.button`
	position: absolute;
	right: -1.2rem;
	top: 0.15rem;
	background: var(--lightestColor);
	border-radius: 1rem;
	height: 1rem;
	padding: 0;
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

const DotsWrapper = styled.span`
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
`
const Dots = () => (
	<DotsWrapper>
		{[...new Array(9)].map((_, index) => (
			<span key={index}></span>
		))}
	</DotsWrapper>
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
