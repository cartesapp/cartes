 import { styled } from 'next-yak'
 
 export const PaymentBannerWrapper = styled.section`
 	position: fixed;
 	top: 0.4rem;
 	left: 0.4rem;
 	@media (min-width: 800px) {
 		top: 94vh;
 		left: 50%;
 		transform: translateX(-50%);
 		height: 1.75rem;
 	}
 	z-index: 10;
 	background: white;
 	padding: 0 0.1rem;
 	border-radius: 0.3rem;
 	box-shadow: rgba(0, 0, 0, 0.3) 0px -2px 16px;
 	color: white;
 	line-height: 1.2rem;
 `
