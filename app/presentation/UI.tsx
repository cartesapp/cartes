 'use client'
 
 import {styled} from 'next-yak'
 
 export const PresentationWrapper = styled.div`
 	max-width: 700px;
 	margin: 3vh auto;
 	padding: 0 4vw;
 	img {
 		max-width: 100%;
 	}
 	header {
 		text-align: center;
 		h2 {
 			font-size: 300%;
 			line-height: 4rem;
 			margin-top: 0;
 			font-weight: 400;
 		}
 		h1 {
 			margin-bottom: 1rem;
 			display: flex;
 			align-items: center;
 			justify-content: center;
 			img {
 				width: 2.4rem;
 				height: auto;
 				margin: 0 0.4rem -0.1rem 0 !important;
 				border-radius: 0 !important;
 			}
 			color: #2988e6;
 		}
 	}
 `
 
 export const WebStore = styled.div`
 	a {
 		text-decoration: none;
 		margin: 0 auto;
 		background: var(--darkestColor);
 		border-radius: 0.6rem;
 		display: flex;
 		align-items: center;
 		width: 10rem;
 		height: 2.8rem;
 		color: white;
 		img {
 			width: 2.4rem;
 			height: auto;
 			margin-right: 0.6rem;
 			margin-left: 0.6rem;
 		}
 		> div {
 			display: flex;
 			flex-direction: column;
 			justify-content: space-between;
 			small {
 				margin-top: -0.2rem;
 				font-size: 70%;
 			}
 			div {
 				font-size: 150%;
 				line-height: 1rem;
 			}
 		}
 	}
 	margin-bottom: 2vh;
 `
 
 export const Screens = styled.div`
 	display: flex;
 	align-items: center;
 	margin-left: -50%;
 	> div {
 		margin-top: -8rem;
 	}
 	> div:nth-child(2) {
 		margin-top: -6rem;
 	}
 	@media (max-width: 800px) {
 		flex-wrap: wrap;
 		margin-left: 0;
 		> div {
 			margin-bottom: -10rem;
 		}
 	}
 `
