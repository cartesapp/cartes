 import { useLocalStorage } from 'usehooks-ts'
 
 import Logo from '@/public/logo.svg'
 import Image from 'next/image'
 
 export default () => {
 	const [tutorials, setTutorials] = useLocalStorage(
 		'tutorials',
 		{},
 
 		{
 			initializeWithValue: false,
 		}
 	)
 
 	return (
 		<button
 			title="À propos de Cartes"
 			onClick={() =>
 				setTutorials((tutorials) => ({
 					...tutorials,
 					introduction: !tutorials.introduction,
 				}))
 			}
 		>
 			<Image src={Logo} alt="Logo de Cartes.app" width="100" height="100" />
 		</button>
 	)
 }
