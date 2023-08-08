import { PropsWithChildren } from 'react'
import ReduxProvider from './ReduxProvider'
import RulesProvider from './RulesProvider'

type P = PropsWithChildren

export default function Providers({ children }: P) {
	return (
		// you can have multiple client side providers wrapped, in this case I am also using NextUIProvider
		<ReduxProvider>
			<RulesProvider>{children}</RulesProvider>
		</ReduxProvider>
	)
}
