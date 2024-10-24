import useSetSearchParams from '@/components/useSetSearchParams'
import closeIcon from '@/public/remove-circle-stroke.svg'
import addIcon from '@/public/add-circle-stroke.svg'
import { Reorder, useDragControls } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { removeStatePart, setAllezPart } from '../SetDestination'
import { replaceArrayIndex } from '@/components/utils/utils'

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
		<section
			css={`
				margin: 0 0 1rem 0;
			`}
		>
			<AddStepButton
				url={setSearchParams({ allez: '->' + allez }, true)}
				title={'Ajouter un point comme départ'}
			/>
			<Reorder.Group
				axis="y"
				values={steps.map((step) => step?.key)}
				onReorder={(newItems) =>
					setSearchParams({ allez: newItems.join('->') })
				}
				css={`
					width: 100%;
					background: var(--lightestColor);
					border-radius: 0.4rem;
					padding: 0.2rem 0.3rem;
					list-style-type: none;
					position: relative;
					z-index: 8;
					border: 1px solid var(--lighterColor);
					li {
						padding: 0.3rem 0.4rem;
						border-bottom: 1px solid var(--lighterColor);
						background: var(--lightestColor);
						display: flex;
						align-items: center;
						justify-content: space-between;
					}
					li:last-child {
						border-bottom: none;
					}
				`}
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
			</Reorder.Group>
			<AddStepButton
				url={setSearchParams({ allez: allez + '->' }, true)}
				title={'Ajouter un point comme destination'}
			/>
		</section>
	)
}
const AddStepButton = ({ url, title, style }) => (
	<div
		css={`
			z-index: 7;
			display: flex;
			align-items: center;
			justify-content: end;
			height: 0.55rem;
			margin-right: 1.8rem;
		`}
	>
		<Link
			href={url}
			title={title}
			css={`
				text-decoration: none;
				margin: 0rem 0.7rem;
				display: inline-block;
				${style}
			`}
		>
			<Image
				src={addIcon}
				alt="Supprimer cette étape"
				css={`
					width: 1.2rem;
					height: auto;
					vertical-align: sub;
					opacity: 0.4;
				`}
			/>
		</Link>
	</div>
)

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
			css={`
				${beingSearched &&
				`
				background: yellow !important;
				`}
			`}
		>
			<div
				css={`
					display: flex;
					justify-content: start;
					align-items: center;
					> span {
						line-height: 1.4rem;
					}
				`}
			>
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
					<Icon text={letterFromIndex(index)} />{' '}
					<span
						css={`
							min-width: 6rem;
							cursor: text;
							${!step || !step.name
								? `font-weight: 300; color: var(--darkColor); font-style: italic`
								: ''}
						`}
					>
						{beingSearched
							? `Choisissez ${stepDefaultName}`
							: step?.name || `Cliquez pour choisir ${stepDefaultName}`}
					</span>
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
								css={`
									margin-left: 0.4rem;
									filter: invert(1);
								`}
							/>{' '}
							annuler
						</button>
					</span>
				)}
			</div>
			<div
				css={`
					position: relative;
					&,
					a {
						display: flex;
						align-items: center;
					}
					> a {
						margin-right: 0.4rem;
					}
				`}
			>
				{index < state.length - 1 && (
					<AddStepButton
						url={setSearchParams({ allez: allez.replace('->', '->->') }, true)}
						title={'Ajouter un point intermédiaire'}
						style={`
					top: 1rem;
  position: absolute;
  right: 1.1rem;
  background: var(--lightestColor);
  border-radius: 1.8rem;
						`}
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
					<div
						css={`
							width: 1.6rem;
						`}
					></div>
				)}
				{index !== 0 && index !== state.length - 1 && (
					<RemoveStepLink {...{ setSearchParams, stepKey: key, state }} />
				)}
			</div>
		</Reorder.Item>
	)
}

const RemoveStepLink = ({ setSearchParams, stepKey, state }) => {
	if (!stepKey) return null

	return (
		<Link
			href={setSearchParams({ allez: removeStatePart(stepKey, state) }, true)}
			css={`
				position: absolute;
				right: -1.6rem;
				top: 0.15rem;
				background: var(--lightestColor);
				border-radius: 1rem;
			`}
		>
			<Image
				src={closeIcon}
				alt="Supprimer cette étape"
				css={`
					width: 1rem;
					height: auto;
					opacity: 0.6;
				`}
			/>
		</Link>
	)
}

const Icon = ({ text }) => (
	<span
		css={`
			display: inline-block;
			margin: 0 0.4rem 0 0;
			background: var(--color);
			color: white;
			width: 1.4rem;
			text-align: center;
			height: 1.4rem;
			line-height: 1.4rem;
			border-radius: 2rem;
		`}
	>
		{text}
	</span>
)

const Dots = () => (
	<span
		css={`
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

export const letterFromIndex = (index) => String.fromCharCode(65 + (index % 26))

export const getHasStepBeingSearched = (state) => {
	return state.some((step) => step && step.stepBeingSearched)
}
