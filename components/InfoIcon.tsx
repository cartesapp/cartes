 import Image from 'next/image'
 import yellowInfo from '@/public/yellow-info.svg'
 import { InlineImage } from './UI'
 
 export default function InfoIcon() {
 	return (
 		<InlineImage>
 			<Image src={yellowInfo} alt="Icône d'information" />
 		</InlineImage>
 	)
 }
