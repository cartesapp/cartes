 import { styled } from 'next-yak'
 import CTA from '../presentation/CTA'
 
 export const List = styled.ol`
 	margin-top: 2rem;
 	padding-left: 1rem;
 	list-style-type: circle;
 	li {
 		margin-bottom: 0.8rem;
 		p {
 			margin: 0;
 		}
 		a {
 		}
 	}
 	li small {
 		color: var(--darkestColor);
 	}
 `
 export const BlogBackButton = ({ children }) => <CTA>{children}</CTA>
 
 export const OtherArticlesSection = styled.section`
 	margin-top: 2vh;
 	padding: 0 0.8rem;
 	max-width: 90vw;
 	overflow: hidden;
 	h2 {
 		width: 700px;
 		margin: 0 auto;
 		margin-bottom: 1rem;
 	}
 `
 export const OtherArticlesList = styled.div`
 	overflow: hidden;
 	width: 50rem;
 	max-width: 90vw;
 	margin: 0;
 	> ol {
 		white-space: nowrap;
 		height: 12rem;
 		display: flex;
 		align-items: center;
 		overflow: scroll;
 		list-style-type: none;
 		padding-left: 0;
 		li {
 			background: white;
 			height: 10rem;
 			width: 14rem;
 			min-width: 14rem;
 			margin: 0 0.6rem;
 			padding: 0.8rem 1.4rem;
 			border: 1px solid var(--lighterColor);
 			border-radius: 0.4rem;
 			white-space: wrap;
 			h3 {
 				margin-top: 0.6rem;
 				margin-bottom: 1rem;
 				height: 5rem;
 			}
 			small {
 				max-height: 6rem;
 				display: block;
 				overflow: hidden;
 			}
 		}
 		li:first-child {
 			margin-left: 0 !important;
 		}
 	}
 `
 
 export const Badge = styled.span`
 	align-items: center;
 	background-color: #eee;
 	border-radius: 0.25rem;
 	color: #3a3a3a;
 	display: inline-flex;
 	flex-direction: row;
 	font-size: 0.875rem;
 	font-weight: 700;
 	line-height: 1.5rem;
 	max-height: none;
 	max-width: 100%;
 	min-height: 1.5rem;
 	overflow: initial;
 	padding: 0 0.5rem;
 	text-transform: uppercase;
 	width: -moz-fit-content;
 	width: fit-content;
 `
