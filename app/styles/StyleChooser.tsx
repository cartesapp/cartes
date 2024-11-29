import { css, styled } from 'next-yak'
import useSetSearchParams from '@/components/useSetSearchParams'
import informationIcon from '@/public/information.svg'
import Image from 'next/image'
import { useLocalStorage } from 'usehooks-ts'
import { ModalCloseButton } from '../UI'
import { styles } from './styles'
import PanoramaxChooser from './PanoramaxChooser'
import TerrainChooser from './TerrainChooser'

const styleList = Object.entries(styles)

export default function StyleChooser({
	style,
	setStyleChooser,
	setSnap,
	searchParams,
	zoom,
	setZoom,
}) {
	const [localStorageStyleKey, setLocalStorageStyleKey] = useLocalStorage(
		'style',
		null,
		{
			initializeWithValue: false,
		}
	)
	const setSearchParams = useSetSearchParams()

	return (
		<section
			css={css`
				h1 {
					font-size: 160%;
					font-weight: 300;
					margin-top: 0;
					margin-left: 0.4rem;
				}
				position: relative;
			`}
		>
			<ModalCloseButton
				title="Fermer l'encart de choix du style"
				onClick={() => {
					setTimeout(() => setSnap(3), 200)
					setSearchParams({ 'choix du style': undefined })
				}}
			/>
			<h1>Fond de carte</h1>
			<StyleOptions>
				<PanoramaxChooser
					{...{ searchParams, setSearchParams, setZoom, zoom }}
				/>
				<TerrainChooser
					{...{
						searchParams,
						setSearchParams,
						setZoom,
						zoom,
						styleKey: style.key,
					}}
				/>
			</StyleOptions>
			<Styles
				styleList={styleList.filter(([, el]) => !el.secondary)}
				setSearchParams={setSearchParams}
				searchParams={searchParams}
				style={style}
			/>
			<details>
				<summary
					css={css`
						color: #aaa;
						text-align: right;
						margin: 1.4rem 1.4rem 0.8rem 0;
					`}
				>
					Autres styles
				</summary>
				<Styles
					styleList={styleList.filter(([, el]) => el.secondary)}
					setSearchParams={setSearchParams}
					style={style}
					searchParams={searchParams}
					setLocalStorageStyleKey={setLocalStorageStyleKey}
				/>
			</details>
		</section>
	)
}

const StyleOptions = styled.section`
	display: flex;
	padding: 0 2rem;
`
const Styles = ({
	style,
	styleList,
	setSearchParams,
	searchParams,
	setLocalStorageStyleKey,
}) => {
	return (
		<StyleList>
			{styleList.map(
				([k, { name, imageAlt, title, image: imageProp, description }]) => {
					const image = (imageProp || k) + '.png'

					const setStyleUrl = () =>
						setSearchParams(
							{
								style: k,
								'choix du style': 'oui',
								allez: searchParams.allez || undefined,
							},
							false,
							true
						)
					return (
						<li key={k}>
							{/* Was previously a Link but for some reason probably after the
 						client useSetSearchParams change, the link reloads the page. Maybe solve this with an object href ? */}
							<Button
								$active={style.key === k}
								onClick={() => {
									setStyleUrl()
									setLocalStorageStyleKey(k)
								}}
								title={'Passer au style ' + (title || name)}
							>
								<img
									src={'/styles/' + image}
									width="50"
									height="50"
									alt={imageAlt}
								/>
								<div
									css={css`
										position: relative;
										width: 100%;
										text-align: center;
										line-height: 1.9rem;
										img {
											position: absolute;
											right: -0.5rem;
											top: -0.6rem;
											width: 1.2rem;
											height: auto;
										}
									`}
								>
									{name}
									{description && (
										<aside
											onClick={(e) => {
												alert(description)
												e.preventDefault()
											}}
										>
											<Image
												src={informationIcon}
												alt="Informations sur le style"
											/>
										</aside>
									)}
								</div>
							</Button>
						</li>
					)
				}
			)}
		</StyleList>
	)
}

const Button = styled.button`
	padding: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-decoration: none;
	color: inherit;
	${(p) => p.$active && `color: var(--color); font-weight: bold`}
	background: white;
	border-radius: 0.4rem;
	border: 1px solid var(--lightestColor);
	> img {
		width: 6rem;
		height: 5rem;
		object-fit: cover;
		border-top-left-radius: 0.4rem;
		border-top-right-radius: 0.4rem;
		${(p) => p.$active && `border: 3px solid var(--color);`}
	}
`

const StyleList = styled.div`
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	align-items: center;
	list-style-type: none;
	margin-top: 1rem;
	li {
		margin: 0.6rem 0.25rem;
	}
`
