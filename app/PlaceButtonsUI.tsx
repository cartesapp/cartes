 'use client'
 
 import {styled} from 'next-yak'
 
 export const PlaceButtonList = styled.ul`
 	padding: 0;
 	list-style-type: none;
 	margin: 1vh auto;
 	display: flex;
 	align-items: center;
 `
 
 export const PlaceButton = styled.li`
 	margin-right: 0.6rem;
 	button {
 		border-radius: 0.6rem;
 		background: var(--color);
 		width: 5rem;
 		height: 4.2rem;
 		padding: 0.5rem 0;
 		color: white;
 
 		> div:first-child  {
 			background: white;
 			height: 1.8rem;
 			width: 1.8rem;
 			border-radius: 1rem;
 			margin: 0 auto 0.2rem;
 			img,
 			svg {
 				width: 100%;
 				height: 100%;
 				padding: 0.25rem;
 			}
 		}
 	}
 `
