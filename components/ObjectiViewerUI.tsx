 'use client'
 import {styled} from 'next-yak'
 
 export const OrderedList = styled.ol`
 	padding-left: 2rem;
 	list-style-type: circle;
 `
 
 export const List = styled.ul`
 	list-style-type: none;
 	margin-bottom: 0;
 	li {
 		margin-left: 1rem;
 	}
 	span:last-of-type {
 		margin-left: 1rem;
 	}
 `
 export const Wrapper = styled.div`
 	border: 1px solid var(--darkColor);
 	padding: 0.2rem 1rem;
 	border-radius: 0.2rem;
 	padding: 0.4rem 0rem;
 	background: var(--darkestColor);
 `
