import {styled} from 'next-styled-components'

export const Button = styled.div`
	display: flex;
	flex-direction: column;
	width: fit-content;
	align-items: center;
	justify-content: center;
	position: relative;
	margin: 0 0.4rem;
	button {
		padding: 0;
		margin: 0 0.1rem;
	}
	color: var(--color);
`
