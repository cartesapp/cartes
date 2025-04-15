import { DialogButton } from '@/app/UI'
import { ExplanationWrapper } from '@/app/ContentUI'
import Explanations from '@/components/explanations.mdx'

export default function Introduction({
	setTutorials,
	tutorials,
	setSearchParams,
	setSnap,
}) {
	return (
		<ExplanationWrapper>
			<Explanations />
			<DialogButton
				onClick={() => {
					setTutorials({ ...tutorials, introduction: true })
					setSearchParams({ intro: undefined })
					setSnap(2)
				}}
			>
				OK
			</DialogButton>
			{/*
				<Analytics />
			*/}
		</ExplanationWrapper>
	)
}
