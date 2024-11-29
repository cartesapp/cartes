 'use client'
 import {styled} from 'next-yak'
 
 export const ElectionFilterLabel = styled.label`
 	background: white;
 	padding: 0 0.6rem 0.1rem 0.4rem;
 	border-radius: 0.3rem;
 	border: 1px solid var(--darkColor);
 	color: var(--darkColor);
 	cursor: pointer;
 	input {
 		margin-right: 0.4rem;
 	}
 `
 
 export const ElectionFilters = styled.ul`
 	list-style-type: none;
 	li  {
 		margin: 0.4rem 0;
 	}
 `
