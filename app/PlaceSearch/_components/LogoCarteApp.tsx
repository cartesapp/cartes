import Logo from '@/public/logo.svg'
import { styled } from 'next-yak'
import Image from 'next/image'
import Link from 'next/link'

export default ({ link }) => {
	return (
		<LogoLink title="À propos de Cartes" href={link}>
			<Image src={Logo} alt="Logo de Cartes.app" width="100" height="100" />
		</LogoLink>
	)
}

const LogoLink = styled(Link)`
	margin: 0;
	padding: 0;
	margin-right: 0.4rem;
	> img {
		width: 2rem;
		height: auto;
		vertical-align: middle;
	}
`
