import { getHasStepBeingSearched } from '@/app/itinerary/Steps'
import { InputStyle } from '@/components/InputStyle'
import { close } from '@/components/icons/close'

type IProps = {
	state: any
	value: any
	setIsMyInputFocused: any
	onDestinationChange: any
	setSnap: any
	placeholder: any
	autofocus: boolean
}

export default ({
	autofocus,
	state,
	value,
	setIsMyInputFocused,
	onDestinationChange,
	setSnap,
	placeholder,
}: IProps) => {
	return (
		<InputStyle
			css={`
				color: white;
				input {
					max-width: 22rem;
					width: 83vw;
					background: var(--lightestColor);
					color: var(--darkColor);
					border: none;
					margin-bottom: 0;
					outline: 0.15rem solid
						${getHasStepBeingSearched(state) ? 'yellow' : 'var(--lightColor)'} !important;
				}
				position: relative;
			`}
		>
			<form
				action="/"
				method="GET"
				role="search">
				<input
					type="text"
					value={value || ''}
					onBlur={() => setIsMyInputFocused(false)}
					onFocus={() => setIsMyInputFocused(true)}
					autoFocus={autofocus}
					onClick={(e) => {
						setSnap(0, 'PlaceSearch')
						/*
					// Old comment :
					// --------------
					// Combining two calls hits the sweet spot between chrome and
					// firefox on android. I couldn't test on safari iOS yet.
					// On firefox, the click on input triggers the keyboard, which
					// makes the modal sheet rerender and lose its 0 snap. Hence the
					// second snap after timeout.
					// On chrome, the first step works correctly, but without this
					// first setSnap, the modal sheet will go way further than the top
					// of the screen ! Strange behaviors.
					// What's written here is interesting but not conclusive for us yet https://github.com/Temzasse/react-modal-sheet?tab=readme-ov-file#%EF%B8%8F-virtual-keyboard-avoidance
					// New comment :
					// ---------
					// We solved this by a hacky useEffect to keep the modal sheet
					// snap when the browser height changes. See ModalSheet.
					//
					setTimeout(() => {
						setSnap(0, 'PlaceSearch')
						e.target.focus()
					}, 600)
					*/
					}}
					placeholder={placeholder || 'Saint-Malo, Nancy, Café du Port...'}
					onChange={({ target: { value } }) => onDestinationChange(value)}
					name="q"
				/>
				{value && (
					<button
						onClick={() => onDestinationChange(null)}
						css={`
							position: absolute;
							right: 5px;
							top: 50%;
							transform: translateY(-50%);
							height: 30px;
							width: 30px;
							padding: 7px;
							color: var(--darkerColor);
						`}
					>
						{close}
					</button>
				)}
			</form>
		</InputStyle>
	)
}
