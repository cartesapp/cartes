 'use client'
 
 import {styled} from 'next-yak'
 
 export const Compass = styled.div`
 	position: relative;
 	width: 320px;
 	height: 320px;
 	border-radius: 50%;
 	box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
 	margin: auto;
 
 	> .arrow {
 		position: absolute;
 		width: 0;
 		height: 0;
 		top: -20px;
 		left: 50%;
 		transform: translateX(-50%);
 		border-style: solid;
 		border-width: 30px 20px 0 20px;
 		border-color: red transparent transparent transparent;
 		z-index: 1;
 	}
 
 	> .compass-circle,
 	> .my-point {
 		position: absolute;
 		width: 90%;
 		height: 90%;
 		top: 50%;
 		left: 50%;
 		transform: translate(-50%, -50%);
 		transition: transform 0.1s ease-out;
 		background: url(https://purepng.com/public/uploads/large/purepng.com-compasscompassinstrumentnavigationcardinal-directionspointsdiagram-1701527842316onq7x.png)
 			center no-repeat;
 		background-size: contain;
 	}
 
 	> .my-point {
 		opacity: 0;
 		width: 20%;
 		height: 20%;
 		background: rgb(8, 223, 69);
 		border-radius: 50%;
 		transition: opacity 0.5s ease-out;
 	}
 `
