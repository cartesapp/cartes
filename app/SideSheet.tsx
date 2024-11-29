import { css } from 'next-yak'
import Content from './Content'
import { modalSheetBoxShadow } from './ModalSheetReminder'

export default function SideSheet(props) {
	return (
		<div
			css={css`
				background-color: var(--lightestColor2) !important;
				width: 26rem;
				margin-top: 1rem;
				padding: 0.4rem 0.6rem;
				border-radius: 0.6rem;
				max-height: 90vh;
				overflow: scroll;
				--shadow-color: 217deg 49% 38%;
				--shadow-elevation-medium: 0.3px 0.5px 0.7px
						hsl(var(--shadow-color) / 0.29),
					0.7px 1.3px 1.7px -0.6px hsl(var(--shadow-color) / 0.29),
					1.3px 2.6px 3.3px -1.2px hsl(var(--shadow-color) / 0.29),
					2.6px 5.2px 6.5px -1.9px hsl(var(--shadow-color) / 0.29),
					5px 10px 12.6px -2.5px hsl(var(--shadow-color) / 0.29);
				box-shadow: var(--shadow-elevation-medium);
				overflow: auto;
				&::-webkit-scrollbar {
					display: none;
				}
				@media (max-width: 800px) {
					position: fixed;
					bottom: 0;
					left: 0;
					width: 100vw;
					${modalSheetBoxShadow}
				}
			`}
		>
			<Content {...props} sideSheet={true} />
		</div>
	)
}
