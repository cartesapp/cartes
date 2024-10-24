import { useEffect, useRef } from 'react'

export function useWhatChanged(
	props: { [prop: string]: unknown },
	fromWhom: string = 'unknown'
) {
	// cache the last set of props
	const prev = useRef(props)

	useEffect(() => {
		// check each prop to see if it has changed
		const changed = Object.entries(props).reduce(
			(a, [key, prop]: [string, unknown]) => {
				if (prev.current[key] === prop) return a
				return {
					...a,
					[key]: {
						prev: prev.current[key],
						next: prop,
					},
				}
			},
			{} as { [k: string]: any }
		)

		if (Object.keys(changed).length > 0) {
			console.log('Props That Changed from ' + fromWhom, changed)
		}

		prev.current = props
	}, [props])
}
