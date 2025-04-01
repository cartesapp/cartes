import Logo from '@/public/logo.svg'
import Image from 'next/image'
import Link from 'next/link'

export default ({ link }) => {
	return (
		<Link title="À propos de Cartes" href={link}>
			<Image src={Logo} alt="Logo de Cartes.app" width="100" height="100" />
		</Link>
	)
}
