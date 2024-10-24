import isWebglSupported from '@/components/isWebglSupported'
import Map from './Map'
import css from '@/components/css/convertToJs'

export default function SafeMap(props) {
	const supported = isWebglSupported()
	if (supported === null) return
	if (supported === false)
		return (
			<section
				style={css`
					margin: 20vh auto 0 auto;
					width: 20rem;
					background: blue;
					color: white;
					padding: 0.4rem 0.8rem;
				`}
			>
				<p>
					La technologie <a href="https://fr.wikipedia.org/wiki/WebGL">WebGL</a>{' '}
					n'est pas activée ou supportée par votre navigateur.
				</p>
				<p>
					Elle est nécessaire pour le rendu rapide de belles cartes modernes.
				</p>
				<p>Cartes ne marchera pas, désolé : !</p>
			</section>
		)
	return <Map {...props} />
}
