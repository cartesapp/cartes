'use client'
import { mapButtonSize } from '@/components/MapButtons'
import Logo from '@/public/logo.svg'
import { styled } from 'next-yak'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import useSetSearchParams from '../../components/useSetSearchParams'
import { MapContainer } from '../Map'
import useAddSobreMap from './useAddSobreMap'
import DpeList from './dpe/DpeList'

const lonLatDistance = ''

const distance = 5 * 1000

export default function Trouver({ searchParams }) {
	const setSearchParams = useSetSearchParams()
	const [letter, setLetter] = useState(searchParams['letter'] || '')
	const [surface, setSurface] = useState(searchParams['surface'] || '')
	const [lngLat, setLngLat] = useState(null)
	const [typeBatiment, setTypeBatiment] = useState(
		searchParams['typeBatiment'] || ''
	)
	const [error, setError] = useState(null)

	const [dpes, setDpes] = useState(null)

	const handleLetterChange = (e) => {
		const newLetter = e.target.value
		setLetter(newLetter)
		setSearchParams({ letter: newLetter, surface, typeBatiment })
	}

	const handleSurfaceChange = (e) => {
		const newSurface = e.target.value
		setSurface(newSurface)
		setSearchParams({ letter, surface: newSurface, typeBatiment })
	}

	const handleTypeBatimentChange = (e) => {
		const newTypeBatiment = e.target.value
		setTypeBatiment(newTypeBatiment)
		setSearchParams({ letter, surface, typeBatiment: newTypeBatiment })
	}

	useEffect(() => {
		if (!lngLat) return
		const lonLatDistance = lngLat.lng + ':' + lngLat.lat + ':' + distance
		const doFetch = async () => {
			//conso_5_usages_par_m2_ep
			//emission_ges_5_usages_par_m2
			//nom_commune_ban
			const url = `https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines?q_mode=simple&qs=etiquette_dpe:+${letter}+AND+type_batiment:${typeBatiment}&geo_distance=${lonLatDistance}`

			try {
				const request = await fetch(url)

				const json = await request.json()
				const results = json.results.map((dpe) => ({
					...dpe,
					geometry: { coordinates: dpe['_geopoint'].split(',').reverse() },
				}))

				setDpes(results)
				console.log('indigo', json)
			} catch (e) {
				setError(e)
			}
		}

		doFetch()
	}, [setError, letter, typeBatiment, lngLat, setDpes])

	const onMapClick = useCallback(
		(lngLat) => {
			setLngLat(lngLat)
		},
		[setLngLat]
	)
	const mapContainerRef = useRef(null)

	useAddSobreMap(mapContainerRef, onMapClick)

	return (
		<Section>
			<button>
				<Image src={Logo} alt="Logo de cartes.app" /> Géolocaliser
			</button>
			{lngLat && (
				<div>
					Coordonnées : {+lngLat.lng.toFixed(2)}, {+lngLat.lat.toFixed(2)}
				</div>
			)}
			<MapContainerContainer>
				<MapContainer ref={mapContainerRef} $mapButtonSize={mapButtonSize} />
			</MapContainerContainer>
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
			{dpes && <DpeList dpes={dpes} latLon={[lngLat.lng, lngLat.lat]} />}
		</Section>
	)
}

const Section = styled.section`
	> button {
		display: flex;
		align-items: center;
		color: var(--darkColor);
		justify-content: center;
		width: 100%;
		margin: 1rem 0;
		gap: 0.4rem;
		img {
			width: 2rem;
			height: 2rem;
		}
	}
`

const MapContainerContainer = styled.section`
	> div {
		width: 90%;
		max-width: 50rem;
		height: 30rem;
		border-radius: 2rem;
		margin: 0 auto;
	}
	margin: 0.4rem 0 1rem;
`
