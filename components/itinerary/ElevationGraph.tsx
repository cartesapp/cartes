import computeDistance from '@turf/distance'
import { styled } from 'next-yak'
import React from 'react'
import {
	computeSlopeGradient,
	hasSignificantSlope,
} from '../../app/itinerary/computeSlopeGradient'

export default function ElevationGraph({
	feature,
	setItineraryPosition,
	itineraryPosition,
}) {
	if (!feature?.geometry) return
	const { coordinates: rawCoordinates } = feature.geometry

	const coordinates = rawCoordinates.filter(
		(point) => point.length === 3 // some point coordinate arrays returned by BRouter do not include an elevation,
		// we just filter them.
		// TODO Could result in some problems with the itiPosition
		// prop
	)

	const start = {
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [coordinates[0][0], coordinates[0][1]],
		},
		properties: {},
	}
	const lowest = Math.min(...coordinates.map((el) => el[2]))

	console.log('purple', feature, lowest)
	const data = coordinates.reduce((memo, [lon, lat, elevation], index) => {
		const last = index && memo[memo.length - 1]

		const newPoint = {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [lon, lat] },
		}
		const newDistance =
			(last?.cumulatedDistance ?? 0) +
			computeDistance(last ? last.point : start, newPoint)
		return [
			...memo,
			{
				x: newDistance,
				y: elevation - lowest,
				cumulatedDistance: newDistance,
				point: newPoint,
			},
		]
	}, [])
	console.log('purple data for chart', data)

	// Créer un geojson pour calculer le gradient de pente
	const featureForGradient = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: coordinates,
				},
				properties: {},
			},
		],
	}

	return (
		<section
			style={{
				margin: '1.6rem 0.4rem',
			}}
		>
			<LineChart
				{...{
					data,
					baseElevation: lowest,
					featureForGradient,
					setItineraryPosition,
					itineraryPosition,
				}}
			/>
		</section>
	)
}

const LineChart = ({
	data,
	baseElevation,
	featureForGradient,
	setItineraryPosition,
	itineraryPosition,
}) => {
	console.log('orange', data)
	let HEIGHT = 150
	let WIDTH = HEIGHT * 2.4
	let TICK_COUNT = 3
	let MAX_X = Math.max(...data.map((d) => d.x))
	let MAX_Y = Math.max(...data.map((d) => d.y))
	let MIN_Y = Math.min(...data.map((d) => d.y))

	// Calculer le gradient de pente pour colorer le chemin
	const slopeGradient = computeSlopeGradient(featureForGradient)
	console.log('orange slopeGradient', slopeGradient)

	// Calculer la distance totale et la différence d'élévation
	const totalDistance = MAX_X * 1000 // en mètres (MAX_X est en km)
	const elevationDiff = MAX_Y - MIN_Y // en mètres

	// Si la différence d'élévation est faible par rapport à la distance, on centre la ligne
	const flattenGraph = !hasSignificantSlope(slopeGradient)
	const centerY = flattenGraph ? (MAX_Y + MIN_Y) / 2 : 0
	const effectiveMaxY = flattenGraph ? centerY + 15 : MAX_Y
	const effectiveMinY = flattenGraph ? centerY - 15 : 0

	let x = (val) => (val / MAX_X) * WIDTH
	let y = (val) =>
		HEIGHT - ((val - effectiveMinY) / (effectiveMaxY - effectiveMinY)) * HEIGHT
	let x_ticks = getTicks(TICK_COUNT, MAX_X)
	let y_ticks = flattenGraph
		? getTicks(TICK_COUNT, effectiveMaxY - effectiveMinY)
				.map((v) => v + effectiveMinY)
				.reverse()
		: getTicks(TICK_COUNT, MAX_Y).reverse()

	// Fonction pour trouver le point le plus proche d'une coordonnée x
	const findClosestPoint = (clickX) => {
		const svgX = (clickX / WIDTH) * MAX_X
		let closest = 0
		let minDistance = Math.abs(data[0].x - svgX)

		for (let i = 1; i < data.length; i++) {
			const distance = Math.abs(data[i].x - svgX)
			if (distance < minDistance) {
				minDistance = distance
				closest = i
			}
		}
		return closest
	}

	const selectedPoint = data[itineraryPosition]

	// Gestionnaire de clic sur le graphique
	const handleGraphClick = (e) => {
		const svgElement = e.currentTarget
		const rect = svgElement.getBoundingClientRect()
		const clickX = e.clientX - rect.left
		const relativeX = (clickX / rect.width) * WIDTH

		const closestPoint = findClosestPoint(relativeX)
		setItineraryPosition(
			itineraryPosition === closestPoint ? null : closestPoint
		)
	}

	// Créer des segments de chemin avec des couleurs différentes selon la pente
	const pathSegments = []
	let currentIndex = 0

	// Première position
	let pathD = `M${x(data[0].x)} ${y(data[0].y)}`

	// Pour chaque segment du gradient (qui est un tableau plat [position, couleur, position, couleur, ...])
	for (let i = 0; i < slopeGradient.length; i += 2) {
		const progress = slopeGradient[i]
		const color = slopeGradient[i + 1]

		// Trouver l'index du point correspondant à cette progression
		const targetIndex = Math.floor(progress * data.length)

		// Si on a des points à ajouter entre currentIndex et targetIndex
		if (targetIndex > currentIndex) {
			// Ajouter tous les points intermédiaires
			for (let j = currentIndex + 1; j <= targetIndex && j < data.length; j++) {
				pathD += ` L${x(data[j].x)} ${y(data[j].y)}`
			}

			// Ajouter ce segment au tableau avec sa couleur
			pathSegments.push({
				d: pathD,
				color: color,
			})

			// Commencer un nouveau segment
			if (targetIndex < data.length - 1) {
				pathD = `M${x(data[targetIndex].x)} ${y(data[targetIndex].y)}`
				currentIndex = targetIndex
			}
		}
	}

	// S'assurer que le dernier segment est complet jusqu'à la fin
	if (currentIndex < data.length - 1) {
		for (let j = currentIndex + 1; j < data.length; j++) {
			pathD += ` L${x(data[j].x)} ${y(data[j].y)}`
		}
		pathSegments.push({
			d: pathD,
			color: slopeGradient[slopeGradient.length - 1],
		})
	}

	// Chemin complet pour le remplissage (sans couleur de pente)
	let d = `M${x(data[0].x)} ${y(data[0].y)} ${data
		.slice(1)
		.map((d) => {
			return `L${x(d.x)} ${y(d.y)}`
		})
		.join(' ')}`

	const last = data[data.length - 1]
	const first = data[0]
	return (
		<LineChartWrapper>
			<div className="LineChart">
				<svg
					width={'100%'}
					viewBox={`-10 -10 ${WIDTH + 20} ${HEIGHT + 20}`}
					onClick={handleGraphClick}
					style={{ cursor: 'pointer' }}
				>
					<defs>
						<linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
							<stop offset="5%" stopColor="var(--lighterColor)" />
							<stop offset="95%" stopColor="var(--lightestColor2)" />
						</linearGradient>
					</defs>
					<path
						d={d + ` L${x(last.x)} ${HEIGHT} L0 ${HEIGHT} L 0 ${x(first.x)}`}
						stroke={'none'}
						fill={'url(#gradient)'}
					/>
					{/* Dessiner chaque segment avec sa couleur de pente */}
					{pathSegments.map((segment, index) => (
						<path
							key={index}
							d={segment.d}
							stroke={segment.color}
							strokeWidth="2.5"
							fill="none"
						/>
					))}
					<circle
						cx={x(data[0].x)}
						cy={y(data[0].y)}
						r="3"
						fill={'var(--lightestColor2)'}
					/>
					<circle
						cx={x(data[data.length - 1].x)}
						cy={y(data[data.length - 1].y)}
						r="3"
						fill={'var(--lightestColor2)'}
					/>
					{selectedPoint && (
						<>
							<circle
								cx={x(selectedPoint.x)}
								cy={y(selectedPoint.y)}
								r="7"
								fill={'var(--color)'}
								stroke={'white'}
								strokeWidth="2"
							/>
							<line
								x1={x(selectedPoint.x)}
								y1={y(selectedPoint.y)}
								x2={WIDTH + 10}
								y2={y(selectedPoint.y)}
								stroke={'var(--darkColor)'}
								strokeWidth="1"
								strokeDasharray="3,3"
							/>
						</>
					)}
				</svg>
				<XAxis>
					{x_ticks.map((v, i) => (
						<div key={v}>
							{Math.round(v)} <small>km</small>
						</div>
					))}
				</XAxis>
				<YAxis>
					{y_ticks.map((v, i) => (
						<div key={v}>
							{Math.round(v + baseElevation)} <small>m</small>
						</div>
					))}
					{selectedPoint && (
						<div
							style={{
								position: 'absolute',
								right: 0,
								top: `${(y(selectedPoint.y) / (HEIGHT + 30)) * 100}%`,
								color: 'var(--darkColor)',
								fontWeight: 'bold',
								background: 'white',
								padding: '.1rem .1rem .2rem',
								height: '1.2rem',
								lineHeight: '1rem',
								borderRadius: '3px',
								border: '1px dashed var(--color)',
								fontSize: '90%',
								boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
							}}
						>
							{Math.round(selectedPoint.y + baseElevation)} <small>m</small>
						</div>
					)}
				</YAxis>
			</div>
		</LineChartWrapper>
	)
}

const LineChartWrapper = styled.div`
	padding: 2rem 3.5rem 2rem 1rem;

	background: var(--lightestColor2);
	border-radius: 0.5rem;
	width: 100%;

	> div {
		position: relative;
		color: var(--lightColor);
		svg {
			fill: none;
			stroke: var(--darkColor);
			display: block;
			stroke-width: 2px;
			border-bottom: 1px solid var(--lighterColor);
		}
	}
`
const YAxis = styled.div`
	font-size: 85%;
	color: var(--color);
	position: absolute;
	top: 0;
	right: -3.2rem;
	bottom: 0px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: flex-end;
	> div::after {
		margin-right: 4px;
		content: attr(data-value);
		display: inline-block;
	}
`
const XAxis = styled.div`
	font-size: 85%;
	position: absolute;
	bottom: -1rem;
	height: 1rem;
	left: 0px;
	right: 0;
	display: flex;
	justify-content: space-between;
	color: var(--color);
`

function getTicks(count, max) {
	return [...Array(count).keys()].map((d) => (max / (count - 1)) * parseInt(d))
}
