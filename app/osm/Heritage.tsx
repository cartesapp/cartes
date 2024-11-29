 export const isHeritageTag = (tag) =>
 	['heritage', 'whc'].some((el) => tag.startsWith(el))
 
 export default function Heritage({ tags }) {
 	console.log('TAGS', tags)
 	const { heritage } = tags
 	if (!heritage) return
 	if (heritage == 1 && tags['heritage:operator'] == 'whc')
 		return <p>Patrimoine mondial de l'UNESCO</p>
 	if (heritage == 2) return <p>Classé monument historique</p>
 	if (heritage == 3) return <p>Inscrit monument historique</p>
 }
