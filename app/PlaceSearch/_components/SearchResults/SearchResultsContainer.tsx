 import {styled} from 'next-yak'
 
 export default styled.div`
 	ul {
 		border-radius: 0.4rem;
 		padding: 0;
 		list-style-type: none;
 		margin-top: 0.2rem;
 		${(p) =>
 			!p.$sideSheet &&
 			`
 										width: auto
 									`}
 	}
 `
