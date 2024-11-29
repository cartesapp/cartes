 'use client'
 
 import {styled} from 'next-yak'
 
 export const FeatureImage = styled.img`
 	--shadow-color: 210deg 28% 58%;
 	--shadow-elevation-medium: 0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.36),
 		0.8px 1.6px 2px -0.8px hsl(var(--shadow-color) / 0.36),
 		2.1px 4.1px 5.2px -1.7px hsl(var(--shadow-color) / 0.36),
 		5px 10px 12.6px -2.5px hsl(var(--shadow-color) / 0.36);
 	box-shadow: var(--shadow-elevation-medium);
 	height: 6rem;
 	width: auto;
 	border-radius: 0.3rem;
 `
