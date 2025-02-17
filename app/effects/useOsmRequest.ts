import { useEffect } from 'react'
import { stepOsmRequest } from '../stepOsmRequest'

// TODO this function will enrich the array of steps stored in the URL
// with an osm object if relevant and if it's not been done already
export default function useOsmRequest(allez, state, setState) {
	useEffect(() => {
		const asyncStateUpdate = async () => {
			const newPoints = allez.map((point) => stepOsmRequest(point, state))
			const newState = await Promise.all(newPoints)
			console.log('lightgreen setState from osmRequest', newState)
			//if (newState.includes(null)) return null
			setState(newState)
		}

		asyncStateUpdate()
	}, [allez, setState])
}
