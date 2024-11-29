 import Image from 'next/image'
 import panoramaxIcon from '@/public/panoramax-simple.svg'
 import panoramaxIconChecked from '@/public/panoramax-simple-choisi.svg'
 import {styled} from 'next-yak'
 
 export default function ({ searchParams, setSearchParams, setZoom, zoom }) {
 	const checked = searchParams.panoramax != null || searchParams.rue === 'oui'
 
 	return (
 		<StyleElementChooserWrapper>
 			<label title="Afficher sur la carte les photos de rue Panoramax disponibles">
 				<input
 					type="checkbox"
 					checked={checked}
 					onChange={() => {
 						if (searchParams.rue === 'oui') setSearchParams({ rue: undefined })
 						else {
 							if (zoom < 7) setZoom(7)
 							setSearchParams({ rue: 'oui' })
 						}
 					}}
 				/>
 				<span>
 					<Image
 						src={checked ? panoramaxIconChecked : panoramaxIcon}
 						alt="Logo du projet Panoramax"
 					/>
 					Photos de rue
 				</span>
 			</label>
 		</StyleElementChooserWrapper>
 	)
 }
 
 export const StyleElementChooserWrapper = styled.section`
 	padding: 0 1rem;
 	label {
 		display: flex;
 		align-items: center;
 		input {
 			margin-right: 0.4rem;
 			display: none;
 		}
 		cursor: pointer;
 		img {
 			width: 1.3rem;
 			margin-bottom: 0.15rem;
 			height: auto;
 			margin-right: 0.2rem;
 			vertical-align: middle;
 		}
 	}
 `
