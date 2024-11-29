 import { utils } from 'publicodes'
 import { capitalise0 } from './utils/utils'
 import Link from 'next/link'
 import { List, OrderedList, Wrapper } from './ObjectiViewerUI'
 
 const FriendlyObjectViewer = ({
 	pathPrefix,
 	data,
 	level = 0,
 	context,
 	searchParams,
 	options = { capitalise0: true },
 }) => {
 	if (data == null) return null
 	const capitaliseOrNot = options.capitalise0 ? capitalise0 : (s) => s
 	if (typeof data === 'string') {
 		try {
 			if (!context) return <span>{capitaliseOrNot(data)}</span>
 			const isRule = utils.disambiguateReference(
 				context.rules,
 				context.dottedName,
 				data
 			)
 
 			return (
 				<Link
 					href={{
 						pathname:
 							pathPrefix + `/documentation/${utils.encodeRuleName(isRule)}`,
 						query: searchParams,
 					}}
 				>
 					{capitaliseOrNot(data)}
 				</Link>
 			)
 		} catch (e) {
 			const Content = <span>{capitaliseOrNot(data)}</span>
 			if (level === 0) return <Wrapper>{Content}</Wrapper>
 			return Content
 		}
 	}
 	if (typeof data === 'number') return <span>{data}</span>
 
 	const isArray = Object.keys(data).every((key) => Number.isInteger(+key))
 	const Level = isArray ? (
 		<OrderedList>
 			{Object.entries(data).map(([key, value]) => (
 				<li key={key}>
 					<FriendlyObjectViewer
 						data={value}
 						level={level + 1}
 						context={context}
 						options={options}
 						pathPrefix={pathPrefix}
 						searchParams={searchParams}
 					/>
 				</li>
 			))}
 		</OrderedList>
 	) : (
 		<List>
 			{Object.entries(data).map(([key, value]) =>
 				typeof value === 'string' || typeof value === 'number' ? (
 					<li key={key}>
 						<span>{capitaliseOrNot(key)}:</span>
 						<span>
 							<FriendlyObjectViewer
 								data={value}
 								searchParams={searchParams}
 								level={level + 1}
 								context={context}
 								options={options}
 								pathPrefix={pathPrefix}
 							/>
 						</span>
 					</li>
 				) : (
 					<li key={key}>
 						<div>{capitaliseOrNot(key)}:</div>
 						<div>
 							<FriendlyObjectViewer
 								data={value}
 								level={level + 1}
 								searchParams={searchParams}
 								context={context}
 								pathPrefix={pathPrefix}
 								options={options}
 							/>
 						</div>
 					</li>
 				)
 			)}
 		</List>
 	)
 
 	if (level === 0) return <Wrapper>{Level}</Wrapper>
 	return Level
 }
 
 export default FriendlyObjectViewer
