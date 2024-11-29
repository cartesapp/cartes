 import useSetSearchParams from '@/components/useSetSearchParams'
 import { AddressDisc, AddressDiscContainer } from '@/components/Address'
 import { SoloTags, processTags } from '@/components/Tags'
 import Image from 'next/image'
 import Link from 'next/link'
 import { useLocalStorage } from 'usehooks-ts'
 import { pointHash } from './BookmarkButton'
 import { geoFeatureToDestination } from './SetDestination'
 import { DialogButton } from './UI'
 import getName from './osm/getName'
 import { buildAddress } from '@/components/osm/buildAddress'
 
 export default function QuickBookmarks({ oldAllez }) {
 	const [bookmarks] = useLocalStorage('bookmarks', [])
 	const [tutorials, setTutorials] = useLocalStorage('tutorials', {})
 	const setSearchParams = useSetSearchParams()
 	const bookmarksUrl = setSearchParams({ favoris: 'oui' }, true)
 	// Tutoriel mis en ligne pendant un moment, peut freiner le nouvel utilisateur
 	// , à réintroduire autrement, peut-être après quelques interactions sur l'app
 	// ?
 	if (false && !tutorials.bookmarks && !bookmarks?.length)
 		return (
 			<p
 				css={css`
 					color: #666;
 					line-height: 1.2rem;
 					margin: 0.6rem 0 0.2rem 0;
 					img {
 						height: 1rem;
 						width: 1rem;
 						vertical-align: middle;
 					}
 				`}
 			>
 				<small>
 					Ajoutez des favoris avec l'étoile{' '}
 					<Image src="/star.svg" alt="" width="10" height="10" /> après une
 					recherche
 				</small>
 				<DialogButton
 					css={css`
 						font-size: 80%;
 						margin-left: 0.3rem;
 					`}
 					onClick={() => setTutorials({ ...tutorials, bookmarks: true })}
 				>
 					OK
 				</DialogButton>
 			</p>
 		)
 	if (bookmarks?.length)
 		return (
 			<section
 				css={css`
 					h3 {
 						font-size: 90%;
 						color: #666;
 						font-weight: 500;
 						margin: 0.2rem 0;
 					}
 					h3 + p {
 						margin-left: 1rem;
 					}
 					header {
 						display: flex;
 						justify-content: space-between;
 						align-items: center;
 					}
 				`}
 			>
 				<header>
 					<h2>Mes favoris</h2>
 					<Link href={bookmarksUrl}>Modifier</Link>
 				</header>
 
 				<section>
 					<h3>Adresses</h3>
 					<ul
 						css={css`
 							padding-left: 0.6rem;
 							display: flex;
 							align-items: center;
 							> li {
 								display: flex;
 								align-items: center;
 								margin: 0 0.4rem;
 							}
 						`}
 					>
 						{bookmarks.map((bookmark) => (
 							<QuickBookmark
 								key={pointHash(bookmark)}
 								bookmark={bookmark}
 								oldAllez={oldAllez}
 							/>
 						))}
 					</ul>
 					<h3>Itinéraires</h3>
 					<p>
 						<small>À venir.</small>
 					</p>
 				</section>
 			</section>
 		)
 }
 
 const QuickBookmark = ({ bookmark, oldAllez }) => {
 	const photonAddress = buildAddress(bookmark.properties, true),
 		osmAddress =
 			bookmark.properties.id && buildAddress(bookmark.properties, false),
 		address = photonAddress || osmAddress
 
 	const { customName, short_name } = bookmark.properties
 	const name = customName || short_name || getName(bookmark.properties)
 	const destination = geoFeatureToDestination(bookmark)
 	const setSearchParams = useSetSearchParams()
 
 	const allez = oldAllez?.startsWith('->')
 		? destination + oldAllez
 		: destination
 	return (
 		<li
 			key={pointHash(bookmark)}
 			css={css`
 				display: flex;
 				justify-content: space-between;
 				align-items: center;
 				padding: 0.3rem 0;
 				margin-bottom: 0.4rem;
 				a {
 					text-decoration: none;
 				}
 			`}
 		>
 			<Link href={setSearchParams({ allez }, true)}>
 				{name ? (
 					<AddressDiscContainer>
 						<SoloTags
 							compact={true}
 							tags={processTags(bookmark.properties)[1]}
 							iconsOnly={true}
 						/>
 						<span>{name}</span>
 					</AddressDiscContainer>
 				) : address ? (
 					<AddressDisc
 						{...{ t: bookmark.properties, noPrefix: osmAddress == null }}
 					/>
 				) : (
 					<div>
 						Point <small>{pointHash(bookmark)}</small>
 					</div>
 				)}
 			</Link>
 		</li>
 	)
 }
