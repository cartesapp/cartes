 export function ColorProviderComponent({ children, variables }) {
 	const variablesEntries = Object.entries(variables).map(([key, value]) => {
 		return [`--${key}`, value]
 	})
 	return (
 		<div
 			style={{
 				minHeight: '100%',
 				display: 'flex',
 				flexDirection: 'column',
 				...Object.fromEntries(variablesEntries),
 			}}
 		>
 			{children}
 		</div>
 	)
 }
