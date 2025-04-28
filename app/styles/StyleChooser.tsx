import useSetSearchParams from '@/components/useSetSearchParams'
import informationIcon from '@/public/information.svg'
import plusIcon from '@/public/plus.svg'
import { css, styled } from 'next-yak'
import Image from 'next/image'
import { ModalCloseButton } from '../UI'
import PanoramaxChooser from './PanoramaxChooser'
import TerrainChooser from './TerrainChooser'
import { styles } from './styles'
import TerraDrawButton from './TerraDrawButton'

const styleListRaw = Object.entries(styles),
	styleList = styleListRaw.filter(
		([key, value]) =>
			(!value.group ||
				// group leader
				value.group === key) &&
			!value.unlisted
	)

export default function StyleChooser({
	style,
	setStyleChooser,
	setSnap,
	searchParams,
	zoom,
	setZoom,
}) {
	const setSearchParams = useSetSearchParams()

	const conditionalStyles = style?.key
		? styleListRaw.filter(
				([key, el]) =>
					el.group === style.key || (style.group && el.group === style.group)
		  )
		: []

	const ifIndex =
		conditionalStyles.length > 0 &&
		styleList.findIndex(([key, value]) => key === conditionalStyles[0][1].group)

	console.log('indigo ign', ifIndex, conditionalStyles)
	const withConditionalStyles =
		ifIndex >= 0
			? [
					...styleList.slice(0, ifIndex + 1),
					...conditionalStyles.filter(([key, value]) => key !== value.group),

					...styleList.slice(ifIndex + 1),
			  ]
			: styleList

	return (
		<Wrapper>
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
				<TerraDrawButton {...{ searchParams, setSearchParams }} />
			</StyleOptions>
			<Styles
				styleList={withConditionalStyles.filter(([, el]) => !el.secondary)}
				setSearchParams={setSearchParams}
				searchParams={searchParams}
				style={style}
			/>
			<details>
				<summary>Autres styles</summary>
				<Styles
					styleList={withConditionalStyles.filter(([, el]) => el.secondary)}
					setSearchParams={setSearchParams}
					style={style}
					searchParams={searchParams}
				/>
			</details>
		</Wrapper>
	)
}

const StyleOptions = styled.section`
	display: flex;
	padding: 0 0.4rem;
	font-size: 95%;
	justify-content: center;
`
const Styles = ({ style, styleList, setSearchParams, searchParams }) => {
	return (
		<StyleList>
			{styleList.map(
				([
					k,
					{
						name,
						imageAlt,
						title,
						image: imageProp,
						description,
						inlineImage,
						group,
					},
				]) => {
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

					const isGroupLeader = group === k
					return (
						<li key={k}>
							{/* Was previously a Link but for some reason probably after the
						client useSetSearchParams change, the link reloads the page. Maybe solve this with an object href ? */}
							<Button
								$active={style.key === k}
								onClick={() => {
									setStyleUrl()
									try {
										localStorage.setItem('style', k)
									} catch (e) {
										console.log("Can't set local storage for style choice")
									}
								}}
								title={'Passer au style ' + (title || name)}
							>
								<img
									src={inlineImage || '/styles/' + image}
									width="50"
									height="50"
									alt={imageAlt}
								/>
								<div>
									{name}
									{description && (
										<aside
											onClick={(e) => {
												alert(description)
												e.preventDefault()
												e.stopPropagation()
											}}
										>
											<Image
												src={informationIcon}
												alt="Informations sur le style"
											/>
										</aside>
									)}
									{isGroupLeader && (
										<aside>
											<Image
												src={plusIcon}
												alt="Ce style a plusieurs sous-styles"
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
	${(p) =>
		p.$active &&
		css`
			color: var(--color);
			font-weight: bold;
		`}
	background: white;
	border-radius: 0.4rem;
	border: 1px solid var(--lightestColor);
	> img {
		width: 6rem;
		height: 5rem;
		object-fit: cover;
		border-top-left-radius: 0.4rem;
		border-top-right-radius: 0.4rem;
		${(p) =>
			p.$active &&
			css`
				border: 3px solid var(--color);
			`}
	}
	div {
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
const Wrapper = styled.section`
	h1 {
		font-size: 160%;
		font-weight: 300;
		margin-top: 0;
		margin-left: 0.4rem;
	}
	position: relative;
	summary {
		color: #aaa;
		text-align: right;
		margin: 1.4rem 1.4rem 0.8rem 0;
	}
`
