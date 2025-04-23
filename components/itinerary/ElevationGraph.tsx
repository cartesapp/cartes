import computeDistance from '@turf/distance'
import { styled } from 'next-yak'
import React from 'react'

export default function ElevationGraph({ feature }) {
	console.log('purple', feature)
	if (!feature?.geometry) return
	const { coordinates } = feature.geometry

	const start = {
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [coordinates[0][0], coordinates[0][1]],
		},
		properties: {},
	}
	const lowest = Math.min(...coordinates.map((el) => el[2]))
	const data = feature.geometry.coordinates.reduce(
		(memo, [lon, lat, elevation], index) => {
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
		},
		[]
	)
	console.log('purple data for chart', data)

	return (
		<section
			style={{
				margin: '1.6rem 0.4rem',
			}}
		>
			<LineChart data={data} baseElevation={lowest} />
		</section>
	)
}

const LineChart = ({ data, baseElevation }) => {
	let HEIGHT = 150
	let WIDTH = HEIGHT * 2.4
	let TICK_COUNT = 3
	let MAX_X = Math.max(...data.map((d) => d.x))
	let MAX_Y = Math.max(...data.map((d) => d.y))
	let MIN_Y = Math.min(...data.map((d) => d.y))

	// Si la différence d'élévation est faible (<30m), on centre la ligne autour du milieu de l'axe y
	const flattenGraph = MAX_Y - MIN_Y < 30
	const centerY = flattenGraph ? (MAX_Y + MIN_Y) / 2 : 0
	const effectiveMaxY = flattenGraph ? centerY + 15 : MAX_Y
	const effectiveMinY = flattenGraph ? centerY - 15 : 0

	const [selectedPoint, setSelectedPoint] = React.useState(null)

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
		let closest = data[0]
		let minDistance = Math.abs(closest.x - svgX)
		
		for (let i = 1; i < data.length; i++) {
			const distance = Math.abs(data[i].x - svgX)
			if (distance < minDistance) {
				minDistance = distance
				closest = data[i]
			}
		}
		return closest
	}

	// Gestionnaire de clic sur le graphique
	const handleGraphClick = (e) => {
		const svgElement = e.currentTarget
		const rect = svgElement.getBoundingClientRect()
		const clickX = e.clientX - rect.left
		const relativeX = (clickX / rect.width) * WIDTH
		
		const closestPoint = findClosestPoint(relativeX)
		setSelectedPoint(closestPoint)
	}

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
					viewBox={`-10 0 ${WIDTH + 20} ${HEIGHT + 10}`}
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
					<path d={d} />
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
								r="5"
								fill={'var(--darkColor)'}
								stroke={'white'}
								strokeWidth="2"
							/>
							<line
								x1={x(selectedPoint.x)}
								y1={y(selectedPoint.y)}
								x2={WIDTH + 10}
								y2={y(selectedPoint.y)}
								stroke={'var(--lighterColor)'}
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
								top: `${y(selectedPoint.y)}px`,
								transform: 'translateY(-50%)',
								color: 'var(--darkColor)',
								fontWeight: 'bold',
								background: 'white',
								padding: '2px 4px',
								borderRadius: '3px',
								fontSize: '90%',
								boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
