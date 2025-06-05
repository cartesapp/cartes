'use client'

import dpeData from './DPE.yaml'

export const conversionLettreIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

export default function DPELabel({
	index,
	label = null,
	small = true,
	border = false,
}) {
	if (label) {
		index = conversionLettreIndex.indexOf(label)
		console.log('indigo', label, index)
	}
	if (typeof index === 'undefined' || isNaN(index)) {
		return (
			<span
				style={{
					display: 'inline-block',
					background: 'lightgrey',
					textAlign: 'center',
					padding: small ? '0.05rem 0.45rem' : '0.7rem 1rem',
					fontWeight: 'bold',
					color: 'black',
					borderRadius: '0.3rem',
				}}
			>
				?
			</span>
		)
	}

	if (+index > 6 || index < 0)
		return (
			<em
				title={`Le DPE d'index ${index} est invalide, il doit être entre 0 (A) et 6 (G)`}
				style={{
					cursor: 'help',
				}}
			>
				DPE invalide
			</em>
		)
	const { couleur, lettre, 'couleur du texte': textColor } = dpeData[+index]
	return (
		<span
			style={{
				display: 'inline-block',
				background: couleur,
				textAlign: 'center',
				padding: small ? '0.05rem 0.45rem' : '0.7rem 1rem',
				fontWeight: 'bold',
				color: textColor || 'black',

				borderRadius: '0.3rem',
				border: border ? '2px solid var(--color)' : '',
			}}
		>
			{lettre}
		</span>
	)
}
