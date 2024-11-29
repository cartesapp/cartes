 import Image from 'next/image'
 export default function CenteredCross() {
 	return (
 		<div
 			css={css`
 				position: fixed;
 				left: 50%;
 				top: 50%;
 				transform: translateX(-50%) translateY(-50%);
 				img {
 					width: 1rem;
 					height: auto;
 				}
 				z-index: 10;
 				filter: drop-shadow(0 0 0.75rem white);
 			`}
 		>
 			<Image src="/cross.svg" alt="Centre de la carte" width="10" height="10" />
 		</div>
 	)
 }
