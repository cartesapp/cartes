'use client'

import { ContentSection } from '@/app/ContentUI'
import { ModalCloseButton } from '@/app/UI'
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { css, styled } from 'next-yak'

export default function PaymentBlock({ setSearchParams, openSheet }) {
	const [choice, setChoice] = useState(false)
	const [message, setMessage] = useState(null)
	const [uuid, setUuid] = useLocalStorage('uuid', null, {
		initializeWithValue: false,
	})

	useEffect(() => {
		if (uuid) return
		setUuid(crypto.randomUUID())
	}, [uuid, setUuid])

	useEffect(() => {
		if (!uuid) return

		const doFetch = async () => {
			try {
				// For now we don't collect votes

				if (!choice) {
					const traceUrl = `https://bright-ant-40.deno.dev/sondage-paiement/${uuid}/vu`
					const traceRequest = await fetch(traceUrl)
					const traceText = await traceRequest.text()
				} else {
					const url = `https://bright-ant-40.deno.dev/sondage-paiement/${uuid}/${choice}`
					const request = await fetch(url)
					const text = await request.text()
					setMessage(text)
				}
			} catch (e) {
				console.log('Erreur dans le sondage de paiement', e)
			}
		}
		doFetch()
	}, [choice, setMessage, uuid])

	return (
		<section>
			<ContentSection>
				<ModalCloseButton
					title="Fermer l'encart abonnement"
					onClick={() => {
						setSearchParams({ abonnement: undefined })
						openSheet(false)
					}}
				/>
				<h2>Financer l'initiative Cartes</h2>
				<p>
					Vous ne trouverez pas de pubs ici. Pour continuer de développer
					l'application, nous aurons besoin de financements. L'objectif initial
					est de couvrir les frais mensuel des serveurs.
				</p>
				{!choice && (
					<section>
						<h3
							css={css`
								font-size: 110%;
							`}
						>
							Comment nous soutenir ?{' '}
						</h3>
						<Buttons>
							<button onClick={() => setChoice('05-mois')}>
								50 centimes par mois
							</button>
							<button onClick={() => setChoice('6-an')}>6 € par an</button>
							<button onClick={() => setChoice('0')}>Pas pour l'instant</button>
						</Buttons>
						<p
							css={css`
								text-align: right;
								margin-top: 1rem;
							`}
						>
							<small>Sans engagement, évidemment.</small>
						</p>
					</section>
				)}
				{choice &&
					(message ? (
						<p
							css={css`
								margin-top: 1rem;
							`}
						>
							{message}
						</p>
					) : (
						<p>Appel en cours...</p>
					))}
			</ContentSection>
		</section>
	)
}

const Buttons = styled.section`
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	justify-content: end;
	button {
		padding: 0.2rem 1rem;
		background: linear-gradient(
			90deg,
			rgba(41, 136, 230, 1) 0%,
			rgba(24, 90, 189, 1) 100%
		);
		color: white;
		box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 6px;
	}
`
