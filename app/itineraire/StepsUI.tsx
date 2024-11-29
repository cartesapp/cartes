import { Reorder } from 'framer-motion'
import { styled } from 'next-yak'
export const StepList = styled(Reorder.Group)`
	width: 100%;
	background: var(--lightestColor);
	border-radius: 0.4rem;
	padding: 0.2rem 0.3rem;
	list-style-type: none;
	position: relative;
	z-index: 8;
	border: 1px solid var(--lighterColor);
	li {
		padding: 0.3rem 0.4rem;
		border-bottom: 1px solid var(--lighterColor);
		background: var(--lightestColor);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	li:last-child {
		border-bottom: none;
	}
`
