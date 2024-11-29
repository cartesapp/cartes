 'use client'
 import {styled} from 'next-yak'
 
 export const Ul = styled.ul`
 	padding-left: 1rem;
 	${(p) =>
 		p.$borderBottom &&
 		`
 	> li {
 	padding-bottom: 2vh;
 	margin-bottom: 5vh;
 		border-bottom: 2px solid var(--color);
 		h3 {
 			text-decoration: underline;
 			text-decoration-color: var(--color);
 		}
 }
 		`}
 `
