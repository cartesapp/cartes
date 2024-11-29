 import computeDistance from '@turf/distance'
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
 			css={css`
 				margin: 1.6rem 0.4rem;
 			`}
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
 
 	let x = (val) => (val / MAX_X) * WIDTH
 	let y = (val) => HEIGHT - (val / MAX_Y) * HEIGHT
 	let x_ticks = getTicks(TICK_COUNT, MAX_X)
 	let y_ticks = getTicks(TICK_COUNT, MAX_Y).reverse()
 
 	let d = `M${x(data[0].x)} ${y(data[0].y)} ${data
 		.slice(1)
 		.map((d) => {
 			return `L${x(d.x)} ${y(d.y)}`
 		})
 		.join(' ')}`
 
 	const last = data[data.length - 1]
 	const first = data[0]
 	return (
 		<div
 			css={css`
 				padding: 2rem 3.5rem 2rem 1rem;
 
 				background: var(--lightestColor2);
 				border-radius: 0.5rem;
 				width: 100%;
 
 				.LineChart {
 					position: relative;
 					color: var(--lightColor);
 				}
 
 				.LineChart svg {
 					fill: none;
 					stroke: var(--darkColor);
 					display: block;
 					stroke-width: 2px;
 					border-bottom: 1px solid var(--lighterColor);
 				}
 
 				.LineChart .x-axis {
 					font-size: 85%;
 					position: absolute;
 					bottom: -1rem;
 					height: 1rem;
 					left: 0px;
 					right: 0;
 					display: flex;
 					justify-content: space-between;
 					color: var(--color);
 				}
 
 				.LineChart .y-axis {
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
 				}
 
 				.LineChart .y-axis > div::after {
 					margin-right: 4px;
 					content: attr(data-value);
 					display: inline-block;
 				}
 			`}
 		>
 			<div className="LineChart">
 				<svg width={'100%'} viewBox={`-10 0 ${WIDTH + 20} ${HEIGHT + 10}`}>
 					<defs>
 						<linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
 							<stop offset="5%" stop-color="var(--lighterColor)" />
 							<stop offset="95%" stop-color="var(--lightestColor2)" />
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
 				</svg>
 				<div className="x-axis">
 					{x_ticks.map((v, i) => (
 						<div>
 							{Math.round(v)} <small>km</small>
 						</div>
 					))}
 				</div>
 				<div className="y-axis">
 					{y_ticks.map((v, i) => (
 						<div>
 							{Math.round(v + baseElevation)} <small>m</small>
 						</div>
 					))}
 				</div>
 			</div>
 		</div>
 	)
 }
 
 function getTicks(count, max) {
 	return [...Array(count).keys()].map((d) => (max / (count - 1)) * parseInt(d))
 }
