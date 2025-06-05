import computeDistance from '@turf/distance'
import { css, styled } from 'next-yak'
import DPELabel from './DPELabel'
import enrich, { etageKey } from './enrich'
import { useEffect, useState } from 'react'
import { SERVER_RUNTIME } from 'next/dist/lib/constants'
import { photonServerUrl } from '@/app/serverUrls'
import Address from '@/components/Address'

const spec = {
	etiquette_dpe: { label: '' },
	numero_dpe: { label: 'n°' },
	étageEstimé: { label: 'étage' },
	type_batiment: { label: '', title: 'maison ou appartement' },
	complement_adresse_logement: { label: 'cmplt' },
}

export default function DpeList({ dpes, startOpen = true, latLon }) {
	console.log('plop', startOpen)
	if (!dpes) return

	console.log(
		'cyan',
		dpes.map(
			(el) =>
				el[etageKey] +
				' ' +
				el['type_batiment'] +
				' | ' +
				el['complement_adresse_logement'] +
				'----->' +
				el['étage']
		),
		dpes
	)

	return (
		<details open={startOpen ? true : false}>
			<summary>Ouvrir la liste des DPE</summary>
			<Wrapper>
				<ol>
					{dpes.map((dpe) => (
						<li key={dpe['numero_dpe']}>
							<ol>
								<li
									key={'id'}
									style={{
										position: 'absolute',
										top: '-.4rem',
										right: '-.4rem',
									}}
								>
									<small>n°{dpe['numero_dpe']}</small>
								</li>
								{Object.entries(spec)
									.filter(([k]) => k !== 'numero_dpe')
									.map(([k, { label, title }]) => (
										<li key={k} title={title}>
											<small>{label}</small>
											{k === 'etiquette_dpe' ? (
												<DPELabel label={dpe[k]} />
											) : dpe[k] === 'appartement' ? (
												'appt'
											) : (
												dpe[k]
											)}
										</li>
									))}
								<li key="distance">
									À{' '}
									{formatDistance(
										computeDistance(dpe['geometry'].coordinates, [
											latLon[0],
											latLon[1],
										])
									)}
								</li>
								<li>
									<AddressContainer latLon={dpe['geometry'].coordinates} />
								</li>
							</ol>
							<button
								css={css`
									position: absolute;
									right: 0;
									bottom: 0;
								`}
								onClick={() => console.log(dpe)}
							>
								<small>log</small>
							</button>
						</li>
					))}
				</ol>
			</Wrapper>
		</details>
	)
}

const formatDistance = (km) => {
	if (km < 1) return Math.round(km * 1000) + ' m'
	if (km < 10) return Math.round(km * 10) / 10 + ' km'
	return Math.round(km) + ' km'
}

const Wrapper = styled.section`
	ol {
		list-style-type: none;
		padding: 0;
		padding-top: 0.7rem;
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
		max-height: 24rem;
		overflow-y: scroll;
		position: relative;
	}
	> ol > li {
		margin: 0.3rem 0 0.7rem;
		width: 16rem;
		padding: 0.4rem 0.4rem;
		position: relative;
		li {
			small {
				margin-right: 0.4rem;
				color: gray;
			}
		}
		> ol {
			justify-content: start;
		}
		border: 1px solid lightgray;
	}
`

const AddressContainer = ({ latLon }) => {
	const [address, setAddress] = useState(null)
	useEffect(() => {
		const doFetch = async () => {
			const url =
				photonServerUrl +
				`/reverse/?lat=${latLon[1]}&lon=${latLon[0]}&radius=10`
			const request = await fetch(url, { cache: 'force-cache' })
			const json = await request.json()
			const found = json?.features?.[0].properties
			setAddress(found)

			console.log('indigo add', json)
		}
		doFetch()
	}, [latLon])

	if (!address) return <span>⚙️ recherche de l'adresse...</span>
	return (
		<span>
			📌
			<Address tags={address} noPrefix={true} />
		</span>
	)
}
