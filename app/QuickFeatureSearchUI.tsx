'use client'

import { styled } from 'next-yak'

const quickSearchButtonwidth = '2.2rem'

export const getMinimumQuickSearchZoom = (mobile) => (mobile ? 10.5 : 12) // On a small screen, 70 %  of the tiles are not visible, hence this rule

export const goldCladding = `
 filter: drop-shadow(0 0 0.15rem gold);
 `

//export const quickSearchButtonStyle = (clicked, background, filter) => `
export const QuickSearchElement = styled.li`
	& {
		position: relative;
		border-radius: ${quickSearchButtonwidth};

		margin-right: 0.2rem;
		img {
			padding: 0.2rem 0.2rem 0.1rem 0.2rem;
		}
		border: 2px solid var(--lighterColor);
		text-align: center;
	}

	& > a,
	& > button {
		width: ${quickSearchButtonwidth};
		height: ${quickSearchButtonwidth};
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	& > * > img {
		padding: 0;
		margin: 0;
		width: 1.2rem;
		height: 1.2rem;
		vertical-align: middle;
		filter: ${(p) =>
			p.$filter ||
			`invert(16%) sepia(24%) saturate(3004%)
 						hue-rotate(180deg) brightness(89%) contrast(98%)`};
	}
	background: ${(p) =>
		!p.$clicked ? p.$background || 'white' : 'var(--lighterColor)'};

	${(p) =>
		p.$clicked &&
		`border-color: var(--darkColor) !important;

 	img {
 	${(p) =>
		p.$filter ||
		`
 		filter: invert(23%) sepia(100%) saturate(1940%) hue-rotate(206deg)
 			brightness(89%) contrast(84%)`};
 	}`}

	${(p) => p.$setGoldCladding && goldCladding}
`
export const SpinningDiscBorder = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	display: block;
	width: calc(${quickSearchButtonwidth} - 0px);
	padding: 3px;
	aspect-ratio: 1;
	border-radius: 50%;
	background: white;
	--_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
	-webkit-mask: var(--_m);
	mask: var(--_m);
	-webkit-mask-composite: source-out;
	mask-composite: subtract;
	animation: l3 1s infinite linear;

	@keyframes l3 {
		to {
			transform: rotate(1turn);
		}
	}
`
export const FeatureListWrapper = styled.div`
	overflow: hidden;
	overflow-x: scroll;
	touch-action: pan-x;
	white-space: nowrap;
	scrollbar-width: none;
	&::-webkit-scrollbar {
		width: 0px;
		height: 0px;
		background: transparent; /* Disable scrollbar Chrome/Safari/Webkit */
	}
	width: calc(100% - 3rem);
`

export const FeatureList = styled.ul`
	padding: 0;
	list-style-type: none;
	display: flex;
	align-items: center;
	${(p) =>
		p.$showMore &&
		`
 							flex-wrap: wrap;
 							li {margin-bottom: .3rem}

 							`}
`
