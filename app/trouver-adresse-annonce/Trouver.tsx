import React, { useState } from 'react';
import useSetSearchParams from '../../components/useSetSearchParams';

export default function Trouver({ searchParams }) {
	const setSearchParams = useSetSearchParams();
	const [letter, setLetter] = useState(searchParams.get('letter') || '');
	const [surface, setSurface] = useState(searchParams.get('surface') || '');

	const handleLetterChange = (e) => {
		const newLetter = e.target.value;
		setLetter(newLetter);
		setSearchParams({ letter: newLetter, surface });
	};

	const handleSurfaceChange = (e) => {
		const newSurface = e.target.value;
		setSurface(newSurface);
		setSearchParams({ letter, surface: newSurface });
	};

	return (
		<section>
			<div>
				<label>
					Choisissez une lettre :
					<select value={letter} onChange={handleLetterChange}>
						<option value="">--Choisissez une lettre--</option>
						{['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((l) => (
							<option key={l} value={l}>
								{l}
							</option>
						))}
					</select>
				</label>
			</div>
			<div>
				<label>
					Surface habitable (m2) :
					<input
						type="number"
						value={surface}
						onChange={handleSurfaceChange}
						min="0"
					/>
				</label>
			</div>
			DPE label ; m2 -> query
		</section>
	);
}
