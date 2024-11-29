import { styled } from 'next-yak'

export const OsmFeatureHeader = styled.header`
	position: relative;
	margin-bottom: 0.8rem;
	h1 {
		margin: 0;
		margin-bottom: 0.3rem;
		font-size: 140%;
		line-height: 1.3rem;
	}
	details {
		margin-top: -2rem;
		summary {
			display: block;
			text-align: right;
		}
		summary img {
			width: 1.2rem;
			height: auto;
		}
		ul {
			margin-left: 1.6rem;
		}
	}
	small {
		text-align: right;
	}
	h2 {
		font-size: 105%;
	}
`

export const OsmFeatureWrapper = styled.section`
	a {
		color: var(--darkColor);
	}
	> small {
		line-height: 0.9rem;
		display: inline-block;
	}
`
