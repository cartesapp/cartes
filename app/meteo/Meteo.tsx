import { sortBy } from '@/components/utils/utils'
import logoMeteoFrance from '@/public/meteo-france.svg'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

const buildIconUrl = (icon) =>
	'https://meteofrance.com/modules/custom/mf_tools_common_theme_public/svg/weather/' +
	icon +
	'.svg'
export default function Meteo({ coordinates }) {
	const [data, setData] = useState(null)
	const [codePostal, setCodePostal] = useState(null)
	const [extended, extend] = useState(true)

	const mobile = useMediaQuery('(max-width: 800px)')

	useEffect(() => {
		if (mobile) extend(false)
	}, [mobile, extend])

	const codeInsee = data?.weather?.position?.insee

	useEffect(() => {
		if (!codeInsee) return

		const doFetch = async () => {
			try {
				// Why ? dunno
				const realCode = codeInsee.slice(0, 5)
				const request = await fetch(
					`https://geo.api.gouv.fr/communes/${realCode}?fields=codesPostaux`
				)
				const json = await request.json()

				if (json.codesPostaux) {
					setCodePostal(json.codesPostaux[0])
				}
			} catch (e) {
				console.log(
					'Impossible de récupérer le code postal à partir du code INSEE pour afficher le lien Météo-France',
					e
				)
			}
		}
		doFetch()
	}, [codeInsee])

	useEffect(() => {
		if (!coordinates) return
		//https://github.com/hacf-fr/meteofrance-api/blob/master/src/meteofrance_api/const.py#L1-L8
		const domain = `https://webservice.meteofrance.com`

		const rainUrl =
			domain +
			`/nowcast/rain?lon=${coordinates[0]}&lat=${coordinates[1]}&token=__Wj7dVSTjV9YGu1guveLyDq0g7S7TfTjaHBTPTpO0kj8__`
		const forecastUrl =
			domain +
			`/forecast?lon=${coordinates[0]}&lat=${coordinates[1]}&token=__Wj7dVSTjV9YGu1guveLyDq0g7S7TfTjaHBTPTpO0kj8__`

		const queries = [
			//['rain', rainUrl], // looks like rain forecast is now in weather
			//forecast !
			['weather', forecastUrl],
		]
		queries.map(async ([key, url]) => {
			const request = await fetch(url)
			const json = await request.json()
			setData((data) => ({ ...data, [key]: json }))
		})
	}, [setData, coordinates])

	//console.log('meteo', data)
	if (!data?.weather) return
	const { weather } = data
	const now = new Date()
	const relevantSorted = sortBy((forecast) => forecast.date)(
		weather.forecast
			.map((forecast) => ({ ...forecast, date: new Date(forecast.dt * 1000) }))
			.filter((forecast) => forecast.date > now)
	)

	const thisHour = relevantSorted[0]
	//console.log('meteo forecast', relevantSorted)
	const isRaining = thisHour.rain['1h'] > 0,
		rainIcon = isRaining
			? 'https://meteofrance.com/modules/custom/mf_tools_common_theme_public/svg/rain/pluie-moderee.svg'
			: 'https://meteofrance.com/modules/custom/mf_tools_common_theme_public/svg/rain/pas-de-pluie.svg'

	const rainAlt = isRaining
		? `Il pleuvra ${thisHour.rain['1h']} mm dans l'heure`
		: "Pas de pluie dans l'heure"
	const weatherText = `À ${
		weather.position.name
	}, tendance : ${thisHour.weather.desc.toLowerCase()}; ${rainAlt}. Source Météo-France`

	const temperature = Math.round(thisHour.T.value)
	return (
		<div
			onClick={() => extend(!extended)}
			css={`
				position: fixed;
				padding: 0.1rem;
				width: 2rem;
				padding: 0.3rem 0;
				height: 4.8rem;
				right: 1rem;
				bottom: 1.6rem;
				> small {
					display: none !important;
				}
				> div {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: space-evenly;
				}

				${extended &&
				`
					bottom: 1rem;
					right: 0rem;
					width: 6.5rem;
					padding: .4rem 0;
					height: 4.2rem;
					> small {
						display: block !important;
					}

					> div {
						align-items: center;
						justify-content: center;
						flex-direction: row;
					}
				`}
				transform: translateX(-50%) translateY(-50%);
				img {
					width: 1.8rem;
					height: auto;
					margin: 0 0.2rem;
					display: inline-block;
				}
				z-index: 10;
				filter: drop-shadow(0 0 0.75rem white);

				background: #ffffff85;
				border: 0px solid lightgrey;
				text-align: center;
				border-radius: 4px;
				box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
				> small,
				> a small {
					white-space: nowrap;
					overflow-x: scroll;
					scrollbar-width: none; /* Firefox */

					max-width: 100%;
					display: block;
					height: 1.6rem;
					margin-top: 0.3rem;
				}
				> small::-webkit-scrollbar {
					display: none; /* Safari and Chrome */
				}
				> a {
					${extended
						? `
					color: inherit;
					display: flex;
					align-items: center;
					justify-content: center;
					img {
						width: 1.2rem;
						height: auto;
					}
					`
						: `display: none`}
				}
			`}
			title={weatherText}
		>
			{codePostal ? (
				<Link
					href={`http://meteofrance.com/previsions-meteo-france/${weather.position.name}/${codePostal}`}
					onClick={(e) => e.stopPropagation()}
				>
					<Image src={logoMeteoFrance} alt="Logo Météo-France" />
					<small>{weather.position.name}</small>
				</Link>
			) : (
				<small>{weather.position.name}</small>
			)}
			<div>
				<small
					css={`
						color: #555;
						font-size: 80%;
					`}
				>
					{temperature}°
				</small>
				<Image
					src={buildIconUrl(thisHour.weather.icon)}
					alt={thisHour.weather.desc}
					width="10"
					height="10"
				/>
				<Image
					src={rainIcon}
					width="10"
					height="10"
					alt={rainAlt}
					css={`
						background: var(--lighterColor);
						border-radius: 1rem;
						width: 1.3rem !important;
					`}
				/>
			</div>
		</div>
	)
}
