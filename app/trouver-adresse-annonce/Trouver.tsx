'use client'
import React, { useEffect, useState } from 'react';
import useSetSearchParams from '../../components/useSetSearchParams';

export default function Trouver({ searchParams }) {
	const setSearchParams = useSetSearchParams();
	const [letter, setLetter] = useState(searchParams['letter'] || '');
	const [surface, setSurface] = useState(searchParams['surface'] || '');
	const [typeBatiment, setTypeBatiment] = useState(searchParams['typeBatiment'] || '');
	const [error, setError] = useState(null)

	const handleLetterChange = (e) => {
		const newLetter = e.target.value;
		setLetter(newLetter);
		setSearchParams({ letter: newLetter, surface, typeBatiment });
	};

	const handleSurfaceChange = (e) => {
		const newSurface = e.target.value;
		setSurface(newSurface);
		setSearchParams({ letter, surface: newSurface, typeBatiment });
	};

	const handleTypeBatimentChange = (e) => {
		const newTypeBatiment = e.target.value;
		setTypeBatiment(newTypeBatiment);
		setSearchParams({ letter, surface, typeBatiment: newTypeBatiment });
	};

	useEffect(()=>{

		const doFetch = async ()=>{

			//conso_5_usages_par_m2_ep
			//emission_ges_5_usages_par_m2
			//nom_commune_ban
			const url = `https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines?q_mode=simple&qs=etiquette_dpe:+${letter}+AND+geo_distance:${lonLatDistance}+AND+type_batiment:${typeBatiment}`

			try {
			const request = await fetch(url)

			const json = await request.json()
			}catch(e){
				setError(e)
			}

		}

		doFetch()
	}, [setError])

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
			<div>
				<label>
					Type de bâtiment :
					<input
						type="radio"
						value="maison"
						checked={typeBatiment === 'maison'}
						onChange={handleTypeBatimentChange}
					/>
					maison
					<input
						type="radio"
						value="appartement"
						checked={typeBatiment === 'appartement'}
						onChange={handleTypeBatimentChange}
					/>
					appartement
				</label>
			</div>
			DPE label ; m2 -> query
		</section>
	);
}
