import {styled} from 'next-styled-components'

export const InputStyle = styled.span`
	input,
	textarea,
	select {
		padding: 0.4rem;
		max-width: 100%;
		margin-bottom: 0.6rem;
		border: 1px solid var(--lighterTextColor);
		border-radius: 0.3rem;
		background-color: var(--darkerColor);
		color: inherit;
		font-size: inherit;
		transition: border-color 0.1s;
		position: relative;
		font-family: inherit;
	}
	input {
		width: 25rem;
		max-width: 80vw;
	}
	textarea {
		width: 100%;
	}

	input[inputmode='numeric'],
	.conversationInput {
		width: 10rem;
		text-align: right;
	}
	input[type='date'] {
		width: auto;
	}
	input[type='number'] {
		appearance: textfield;
		text-align: right;
	}
	${(props) =>
		props.suffixed &&
		`
	input {
		text-align: right;
	}
	`}
	input:focus,
	select:focus {
		border-color: var(--color);
	}

	input:placeholder {
		opacity: 0.75;
		color: var(--lighterColor);
	}
`
