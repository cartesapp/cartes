'use client'
import computeDistance from '@turf/distance'
import { mapButtonSize } from '@/components/MapButtons'
import Logo from '@/public/logo.svg'
import { styled } from 'next-yak'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import useSetSearchParams from '../../components/useSetSearchParams'
import { MapContainer } from '../Map'
import useAddSobreMap from './useAddSobreMap'
import DpeList from './dpe/DpeList'
import DPEMarkers from './dpe/DPEMarkers'
import dpeColors from './dpe/DPE.yaml'
import enrich from './dpe/enrich'

const lonLatDistance = ''

const distance = 5 * 1000

const deserialiseLngLat = (lngLat) => {
	if (!lngLat) return null
	const [lng, lat] = lngLat.split('|')
	return { lng: +lng, lat: +lat }
}
export default function Trouver({ searchParams }) {
	const setSearchParams = useSetSearchParams()
	const [letter, setLetter] = useState(searchParams['letter'] || 'D')
	const [surface, setSurface] = useState(searchParams['surface'] || '90')
	const [clicked, setClicked] = useState(false)

	const [lngLat, setLngLat] = useState(
		deserialiseLngLat(searchParams['lngLat'])
	)
	const [typeBatiment, setTypeBatiment] = useState(
		searchParams['typeBatiment'] || 'maison'
	)
	const [error, setError] = useState(null)

	const [rawDpes, setDpes] = useState(null)

	const dpes = rawDpes && rawDpes.slice(0, 6)

	const handleLetterChange = (e) => {
		const newLetter = e.target.value
		setLetter(newLetter)
		setSearchParams({ letter: newLetter })
	}

	const handleSurfaceChange = (e) => {
		const newSurface = e.target.value
		setSurface(newSurface)
		setSearchParams({ surface: newSurface })
	}

	const handleTypeBatimentChange = (e) => {
		const newTypeBatiment = e.target.value
		setTypeBatiment(newTypeBatiment)
		setSearchParams({ typeBatiment: newTypeBatiment })
	}

	useEffect(() => {
		if (!lngLat) return
		const lonLatDistance = lngLat.lng + ':' + lngLat.lat + ':' + distance
		const surfaceDown = Math.round(surface) - 1,
			surfaceUp = Math.round(surface) + 2
		const doFetch = async () => {
			//conso_5_usages_par_m2_ep
			//emission_ges_5_usages_par_m2
			//nom_commune_ban
			const url = `https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines?q_mode=simple&qs=etiquette_dpe:+${letter}+AND+type_batiment:${typeBatiment}+AND+surface_habitable_logement:[${surfaceDown} TO ${surfaceUp}]&geo_distance=${lonLatDistance}`

			try {
				const request = await fetch(url)

				const json = await request.json()
				const results = enrich(
					json.results
						.map((dpe) => {
							const geometry = {
								coordinates: dpe['_geopoint'].split(',').reverse(),
							}
							return {
								...dpe,
								geometry,
								distance: computeDistance(geometry.coordinates, [
									lngLat.lng,
									lngLat.lat,
								]),
							}
						})
						.sort((a, b) => a.distance - b.distance)
				)

				setDpes(results)
				console.log('indigo results', results)
			} catch (e) {
				setError(e)
			}
		}

		doFetch()
	}, [setError, letter, typeBatiment, lngLat, setDpes, surface])

	const onMapClick = useCallback(
		(lngLat) => {
			setLngLat(lngLat)

			setSearchParams({ lngLat: lngLat.lng + '|' + lngLat.lat })
		},
		[setLngLat]
	)
	const mapContainerRef = useRef(null)

	const [map] = useAddSobreMap(mapContainerRef, onMapClick, lngLat)

	return (
		<Section>
			<button>
				<Image src={Logo} alt="Logo de cartes.app" />{' '}
				{!lngLat ? (
					<span>Cliquez sur l'endroit le plus probable</span>
				) : (
					<span>
						📍 {+lngLat.lng.toFixed(2)}, {+lngLat.lat.toFixed(2)}
					</span>
				)}
			</button>
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
			{map && dpes && (
				<DPEMarkers
					map={map}
					selectMarker={setClicked}
					featureCollection={{
						type: 'FeatureCollection',
						features: dpes.map((dpe) => {
							const { etiquette_dpe: etiquette } = dpe
							const [lon, lat] = dpe.geometry.coordinates

							const color = dpeColors.find(
								(dpe) => dpe.lettre === etiquette
							).couleur

							console.log('indigo ya', dpe['étageEstimé'])
							const floor = dpe['étageEstimé'] ?? 20

							return {
								type: 'Feature',
								geometry: {
									coordinates: [+lon, +lat],
									type: 'Point',
								},
								properties: {
									...dpe,
									top: (floor + 1) * 3,
									base: floor * 3,
									height: 3,
									etiquette,
									surface: +dpe['surface_habitable_logement'],
									color,
								},
							}
						}),
					}}
				/>
			)}
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
