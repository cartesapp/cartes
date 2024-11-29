 'use client'
 
 import {styled} from 'next-yak'
 
 export const Text = styled.span`
 	display: inline-flex;
 	vertical-align: middle;
 	align-items: center;
 `
 
 export const Image = styled.img`
 	aspect-ratio: 1 / 1;
 	width: ${(props) => props.$imageSize}em;
 	height: ${(props) => props.$imageSize}em;
 	vertical-align: middle !important;
 	${(props) => props.$white && 'filter: invert(1)'}
 `
