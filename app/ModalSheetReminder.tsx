import { css, styled } from 'next-yak'
import Image from 'next/image'

import loupe from '@/public/loupe.svg'

export const modalSheetBoxShadow = css`
	box-shadow: rgba(0, 0, 0, 0.3) 0px -2px 16px;
`
const popSize = 6
export default function ModalSheetReminder({ setOpen }) {
	return (
		<ReminderWrapper onClick={() => setOpen(true)}>
			<Image src={loupe} width="10" height="10" alt="" />
		</ReminderWrapper>
	)
}

const ReminderWrapper = styled.div`
	z-index: 11;
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

	> img {
		z-index: 12;
		width: 2.6rem;
		height: auto;
		position: absolute;
		top: 0.5rem;
		right: 0.6rem;
	}
`
