 export default ({ setIsLocalSearch, isLocalSearch, state, stepIndex }) => (
 	<label
 		css={css`
 			text-align: right;
 			margin: 0 0 auto auto;
 			display: block;
 			width: 8rem;
 			margin-top: 0.2rem;
 			background: var(--darkerColor);
 			color: white;
 			padding: 0rem 0.6rem 0rem;
 			border-radius: 0.3rem;
 			> span {
 				margin-left: 0.4rem;
 			}
 		`}
 	>
 		<input
 			type="checkbox"
 			defaultChecked={isLocalSearch}
 			onClick={() => {
 				setIsLocalSearch((value) => !value)
 			}}
 		/>
 		<span>Chercher ici</span>
 	</label>
 )
