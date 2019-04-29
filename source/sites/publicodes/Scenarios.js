import { React, emoji } from 'Components'
import { useContext } from 'react'
import scenarios from './scenarios.yaml'
import { StoreContext } from './StoreContext'

export default () => {
	let { state, dispatch } = useContext(StoreContext)

	return (
		<section id="scenarios">
			<h1>Quel futur souhaitez vous ?</h1>
			<p>
				Pour mieux comprendre ce que signifie l'impact carbone d'un geste de la
				vie quotidienne, nous l'avons converti en temps.{' '}
			</p>
			<p>
				Si un vol émet 500kg d'équivalent CO₂ (c'est ainsi que l'on mesure la
				contribution au réchauffement climatique), et qu'on estime que la limite
				acceptable par personne est de 6 tonnes, alors ce vol consomme 5/6èmes
				de notre crédit à l'année, soit exactement un mois : en 2 heures, la
				durée du vol, nous avons grillé 1 mois de notre crédit annuel !
			</p>
			<p>
				Reste alors l'énorme enjeu de définir cette limite par personne.{' '}
				{emoji('👇🏻')}
			</p>
			<ul
				css={`
					list-style-type: none;
					display: flex;
					flex-wrap: wrap;
					width: 80vw;
					position: absolute;
					left: 10vw;
				`}>
				{Object.entries(scenarios).map(([nom, s]) => (
					<li
						className="ui__ card"
						css={`
							width: 16vw;
							min-width: 16em;
							margin: 1em;

							h2 {
								margin-top: 0;
							}
							p {
								display: inline;
								font-style: italic;
							}
							label {
								cursor: pointer;
								display: block;
							}

							:hover {
								background: var(--colour);
								color: var(--textColour);
							}
						`}>
						<label>
							<input
								type="radio"
								name="scenario"
								value={nom}
								checked={state.scenario === nom}
								onChange={() =>
									dispatch({ type: 'SET_SCENARIO', scenario: nom })
								}
							/>
							Scénario {nom}
							<h2>{s.titre}</h2>
							<div>
								{emoji('🇫🇷')} Crédit carbone par tête :{' '}
								{s['crédit carbone par personne']}&nbsp;t
							</div>
							<div>
								{emoji('🌡️ ')}Réchauffement : {s.réchauffement}
							</div>
							<div css="margin-top: 1em">
								<span>{emoji(s.icône)}</span>&nbsp;
								<p>{s.description}</p>
							</div>
						</label>
					</li>
				))}
			</ul>
		</section>
	)
}
