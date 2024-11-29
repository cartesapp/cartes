 import css from '../css/convertToJs'
 
 export default function Diapo({ children }) {
 	return (
 		<div
 			css={css`
 				height: 100vh;
 			`}
 		>
 			{children}
 		</div>
 	)
 }
