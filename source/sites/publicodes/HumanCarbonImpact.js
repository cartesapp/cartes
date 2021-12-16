import { mapObjIndexed, toPairs } from 'ramda'
import React from 'react'
import emoji from 'react-easy-emoji'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import * as chrono from './chrono'
import scenarios from './scenarios.yaml'
import { useNextQuestions } from 'Components/utils/useNextQuestion'
import styled from 'styled-components'
import { humanWeight } from './HumanWeight'
import { utils } from 'publicodes'
const { encodeRuleName } = utils

let limitPerPeriod = (scenario) =>
	mapObjIndexed(
		(v) => v * scenarios[scenario]['crédit carbone par personne'] * 1000,
		{
			...chrono,
			négligeable: 0,
		}
	)

let findPeriod = (scenario, nodeValue) =>
	toPairs(limitPerPeriod(scenario)).find(
		([, limit]) => limit <= Math.abs(nodeValue)
	)

let humanCarbonImpactData = (scenario, nodeValue) => {
	let [closestPeriod, closestPeriodValue] = findPeriod(scenario, nodeValue),
		factor = Math.round(nodeValue / closestPeriodValue),
		closestPeriodLabel = closestPeriod.startsWith('demi')
			? closestPeriod.replace('demi', 'demi-')
			: closestPeriod

	return { closestPeriod, closestPeriodValue, closestPeriodLabel, factor }
}

export default ({ nodeValue, formule, dottedName }) => {
	const scenario = useSelector((state) => state.scenario)
	const nextSteps = useNextQuestions()
	const foldedSteps = useSelector((state) => state.simulation?.foldedSteps)
	let { closestPeriodLabel, closestPeriod, factor } = humanCarbonImpactData(
		scenario,
		nodeValue
	)
	const [value, unit] = humanWeight(nodeValue)
	return (
		<div
			css={`
				border-radius: 6px;
				background: var(--color);
				padding: 1em;
				margin: 0 auto;
				color: var(--textColor);
			`}
		>
			{closestPeriodLabel === 'négligeable' ? (
				<span>Impact négligeable {emoji('😎')}</span>
			) : (
				<>
					<div
						css={`
							font-size: 220%;
							margin-bottom: 0.25rem;
						`}
					>
						{factor +
							' ' +
							closestPeriodLabel +
							(closestPeriod[closestPeriod.length - 1] !== 's' &&
							Math.abs(factor) > 1
								? 's'
								: '')}
					</div>
					de&nbsp;
					<Link css="color: inherit" to="/scénarios">
						crédit carbone personnel
					</Link>
					<Link
						css="color: inherit"
						to={'/documentation/' + encodeRuleName(dottedName)}
					>
						<p
							css={`
								margin: 0.6rem 0 0;
								font-style: italic;
								background: var(--lighterColor);
								color: var(--darkColor);
								display: inline-block;
								padding: 0 0.4rem;
								border-radius: 0.4rem;
							`}
						>
							Soit {value} {unit} de CO₂e
						</p>
					</Link>
				</>
			)}

			{nextSteps?.length > 0 && (
				<FirstEstimationStamp>
					{!foldedSteps.length ? '1ère estimation' : 'estimation'}
				</FirstEstimationStamp>
			)}
		</div>
	)
}

let FirstEstimationStamp = styled.div`
	position: absolute;
	font-size: 100%;
	font-weight: 600;
	display: inline-block;
	padding: 0rem 1rem;
	text-transform: uppercase;
	border-radius: 1rem;
	font-family: 'Courier';
	mix-blend-mode: lighten;
	color: lightgrey;
	border: 0.15rem solid lightgrey;
	-webkit-mask-position: 13rem 6rem;
	-webkit-transform: rotate(-16deg);
	-ms-transform: rotate(-16deg);
	transform: rotate(-7deg);
	border-radius: 4px;
	top: 13em;
	right: -3em;
`
