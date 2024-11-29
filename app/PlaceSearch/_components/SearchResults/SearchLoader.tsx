import { Loader } from '@/components/loader'
import { css } from 'next-yak'

export default () => (
	<div
		css={css`
			font-size: 90%;
			text-align: center;
			margin: 20px 0;
		`}
	>
		<Loader>
			<i>Recherche en cours</i>
		</Loader>
	</div>
)
