 import Image from 'next/image'
 import SearchResultsContainer from './SearchResultsContainer'
 
 export default ({
 	sideSheet,
 	onDestinationChange,
 	searchHistory,
 	setSearchHistory,
 }) => {
 	return (
 		<SearchResultsContainer $sideSheet={sideSheet}>
 			<div
 				css={css`
 					display: flex;
 					justify-content: center;
 					align-items: center;
 					img {
 						width: 0.9rem;
 						height: auto;
 						vertical-align: sub;
 					}
 				`}
 			>
 				<small>Historique</small>
 				<button
 					onClick={() => setSearchHistory([])}
 					title="Effacer l'historique"
 				>
 					<Image src="/trash.svg" width="10" height="10" alt="Icône poubelle" />
 				</button>
 			</div>
 			<ul
 				css={css`
 					li:not(:last-of-type) {
 						border-bottom: 1px solid var(--lightestColor);
 					}
 					li {
 						padding: 0.4rem 0;
 						list-style-type: none;
 						font-size: 90%;
 						line-height: 130%;
 					}
 					li:hover {
 						background: var(--lightestColor);
 					}
 				`}
 			>
 				{searchHistory.map((entry) => (
 					<li key={entry}>
 						<button onClick={() => onDestinationChange(entry)}>{entry}</button>
 					</li>
 				))}
 			</ul>
 		</SearchResultsContainer>
 	)
 }
