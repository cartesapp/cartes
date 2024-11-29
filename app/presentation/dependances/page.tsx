 import {css} from 'next-yak'
 import { PresentationWrapper } from '../UI'
 import TechDependenciesGallery from '@/components/TechDependenciesGallery'
 
 export default function () {
 	return (
 		<PresentationWrapper>
 			<header>
 				<h1>Dépendances de cartes.app</h1>
 			</header>
 			<p>
 				Cartes est construit sur une ribambelle de projets libres. C'est donc un
 				effort de plomberie pour connecter de nombreuses merveilles.
 			</p>
 			<p>En voici une sélection.</p>
 			<section
 				css={css`
 					margin: 2rem 0;
 				`}
 			>
 				<TechDependenciesGallery
 					css={css`
 						max-width: 100%;
 						gap: 6vh;
 					`}
 				/>
 			</section>
 		</PresentationWrapper>
 	)
 }
