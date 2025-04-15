import { DialogButton, ModalCloseButton } from '@/app/UI'
import Explanations from '@/components/explanations.mdx'
import News from './news/News'
import { styled } from 'next-yak'

export default function Introduction({
	setTutorials,
	tutorials,
	setSearchParams,
	setSnap,
}) {
	const close = () => {
		setTutorials({ ...tutorials, introduction: true })
		setSearchParams({ intro: undefined })
		setSnap(2)
	}
	return (
		<ExplanationWrapper>
			<ModalCloseButton
				title="Fermer l'encart point d'intérêt"
				onClick={close}
			/>
			<News />
			<Explanations />
			<div>
				<DialogButton onClick={close}>OK</DialogButton>
			</div>
			{/*
				<Analytics />
			*/}
		</ExplanationWrapper>
	)
}

const ExplanationWrapper = styled.div`
	> button {
		right: 0.3rem;
		@media (max-width: 800px) {
			top: -0.4rem;
		}
	}
	h1 {
		margin-top: 0;
		margin-bottom: -0.4rem;
	}
	ol {
		padding-left: 1.5rem;
	}
	margin: 1vw 1rem;
	a {
		color: var(--darkestColor);
	}
	p {
		margin: 1rem 0;
		line-height: 1.4rem;
	}
	> div > button {
		display: block;
		margin: 0 0 0 auto;
	}
`
