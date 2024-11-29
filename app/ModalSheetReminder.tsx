import Emoji from '@/components/Emoji'
import { css, styled } from 'next-yak'

export const modalSheetBoxShadow = css`
	box-shadow: rgba(0, 0, 0, 0.3) 0px -2px 16px;
`
const popSize = 6
export default function ModalSheetReminder({ setOpen }) {
	return (
		<ReminderWrapper onClick={() => setOpen(true)}>
			<Emoji e="🔎" />
		</ReminderWrapper>
	)
}

const ReminderWrapper = styled.div`
	background: red;
	position: fixed;
	bottom: -${popSize / 2}rem;
	left: -${popSize / 2}rem;
	background: var(--lightestColor);
	width: ${popSize}rem;
	height: ${popSize}rem;
	border-radius: ${popSize}rem;
	border: 2px solid var(--color);
	${modalSheetBoxShadow}
	cursor: pointer;
	> span {
		position: absolute;
		top: 0.9rem;
		right: 0.9rem;
	}
`
