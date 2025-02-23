import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const NextStepsClient = dynamic(() => import('./NextSteps'), {
	ssr: false,
})

export default function NextStepsServer(props) {
	return (
		<Suspense>
			<NextStepsClient {...props} />
		</Suspense>
	)
}
