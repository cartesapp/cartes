import Address, { addressKeys } from '@/components/Address'
import ContactAndSocial from '@/components/ContactAndSocial'
import Emoji from '@/components/Emoji'
import OsmLinks from '@/components/OsmLinks'
import SimilarNodes from '@/components/SimilarNodes'
import Tags, {
	SoloTags,
	getFrenchAdminLevel,
	processTags,
} from '@/components/Tags'
import Wikipedia from '@/components/Wikipedia'
import { omit } from '@/components/utils/utils'
import languageIcon from '@/public/language.svg'
import Image from 'next/image'
import GareInfo from './GareInfo'
import Heritage from './osm/Heritage'
import { OpeningHours } from './osm/OpeningHours'
import getName, { getNameKeys, getNames } from './osm/getName'
import Brand, { Wikidata } from './tags/Brand'
import Stop, { isNotTransportStop, transportKeys } from './transport/stop/Stop'
import { computeSncfUicControlDigit } from './utils'
import { css } from 'next-yak'
import { OsmFeatureHeader, OsmFeatureWrapper } from './OsmFeatureUI'

export default function OsmFeature({ data, transportStopData }) {
	if (!data.tags) return null
	const { tags } = data

	const id = data.id
	const featureType = data.type || data.featureType

	/**
	 * TODO this is a suboptimal design :
	 * - processing functions that handle objects and text should be extracted from
	 * react components in order to be usable in app/page.tsx metadata creation
	 * - this tag extraction design should be replaced by specifying tagHandlers
	 * that produce :
	 *   - a react component
	 *   - a pure text rendering
	 *   - the tags they are excluding from basic rendering
	 * In an ideal world, all tags will be tailored
	 * Rendez-vous in 2029 to see if autonomous cars are to be seen in the french streets before all osm tags are classified :)
	 */

	// Copy tags here that could be important to qualify the object with icons :
	// they should not be extracted, just copied

	const { leisure } = tags
	// Extract here tags that do not qualify the object : they won't be available
	// anymore in `rest`
	const {
		description,
		'name:br': nameBrezhoneg,
		opening_hours,
		phone: phone1,
		'contact:phone': phone2,
		'contact:mobile': phone3,
		email,
		'contact:email': email2,
		website: website1,
		'website:menu': menu,
		'contact:website': website2,
		'contact:instagram': instagram,
		'contact:facebook': facebook,
		'contact:whatsapp': whatsapp,
		'contact:youtube': youtube,
		'contact:linkedin': linkedin,
		'ref:FR:SIRET': siret,
		brand: brand,
		'brand:wikidata': brandWikidata,
		'brand:wikipedia': brandWikipedia,
		'ref:FR:Allocine': allocine,
		'ref:mhs': mérimée,
		admin_level: adminLevel,
		wikipedia,
		wikidata,
		image,
		panoramax, //handled by ZoneImages
		...rest
	} = tags

	const frenchAdminLevel = getFrenchAdminLevel(tags, adminLevel)

	const phone = phone1 || phone2 || phone3,
		website = website1 || website2

	const name = getName(tags)
	const nameKeys = getNameKeys(tags)

	const filteredRest = omit([addressKeys, transportKeys, nameKeys].flat(), rest)

	const [keyValueTags, soloTags] = processTags(filteredRest)

	const filteredSoloTags = frenchAdminLevel
		? [
				...soloTags.filter((tag) => {
					return !['Limite administrative', 'Frontière'].includes(tag[1][0])
				}),
				['hexagone-contour.svg', [frenchAdminLevel]],
		  ]
		: soloTags

	return (
		<OsmFeatureWrapper>
			<SoloTags tags={filteredSoloTags} />
			<OsmFeatureHeader>
				<h1>{name}</h1>
				<details>
					<summary title="Nom du lieu dans d'autres langues">
						<Image src={languageIcon} alt="Icône polyglotte" />
					</summary>
					<h2>Noms dans les autres langues : </h2>
					<ul>
						{getNames(tags).map(([key, [value, altNames]]) => (
							<li key={key}>
								<span
									css={css`
										color: gray;
									`}
								>
									{key.replace('name:', '')}
								</span>{' '}
								: {value} {altNames.length > 0 && `, ${altNames.join(', ')}`}
							</li>
						))}
					</ul>
				</details>
				{nameBrezhoneg && nameBrezhoneg !== name && (
					<small>
						<Emoji extra="1F3F4-E0066-E0072-E0062-E0072-E0065-E007F" />{' '}
						{nameBrezhoneg}
					</small>
				)}
			</OsmFeatureHeader>
			{description && <small>{description}</small>}
			{adminLevel && !frenchAdminLevel && (
				<div>
					<span>Niveau administratif : {adminLevel}</span>
				</div>
			)}
			<Address tags={tags} />
			{tags.uic_ref && (
				<GareInfo
					{...{
						nom: tags.name,
						uic8: tags.uic_ref + computeSncfUicControlDigit(tags.uic_ref),
					}}
				/>
			)}
			{wikipedia && wikipedia.includes(':') && <Wikipedia name={wikipedia} />}
			{mérimée && (
				<a
					href={`https://www.pop.culture.gouv.fr/notice/merimee/${mérimée}`}
					target="_blank"
					title="Lien vers la fiche sur la plateforme ouverte du patrimoine"
				>
					🏛️ Fiche patrimoine
				</a>
			)}
			{phone && (
				<div>
					<a href={`tel:${phone}`}>
						<Emoji e="☎️" /> {phone}
					</a>
				</div>
			)}
			{website && (
				<div>
					<a
						href={website.startsWith('http') ? website : 'https://' + website}
						target="_blank"
						title="Site Web"
					>
						<Emoji e="🌍️" /> <span>Site web</span>
					</a>
				</div>
			)}
			{menu && (
				<div>
					<a href={menu} target="_blank" title="Menu">
						<Emoji e="📋" /> <span>Menu</span>
					</a>
				</div>
			)}
			{opening_hours && <OpeningHours opening_hours={opening_hours} />}
			<ContactAndSocial
				{...{
					email: email || email2,
					instagram,
					facebook,
					whatsapp,
					youtube,
					linkedin,
					siret,
				}}
			/>
			{!isNotTransportStop(tags) && (
				<Stop tags={tags} data={transportStopData} />
			)}
			<Heritage tags={tags} />
			{allocine && (
				<a
					href={`https://www.allocine.fr/seance/salle_gen_csalle=${allocine}.html`}
					target="_blank"
					title="Lien vers la fiche cinéma sur Allocine"
				>
					Fiche Allociné
				</a>
			)}
			{leisure && leisure == 'playground' && (
				<a
					href={`https://playguide.eu/app/osm/${featureType}/${id}`}
					target="_blank"
					title="Lien vers la fiche de l'aire sur PlayGuide"
					css={css`
						display: flex;
						align-items: center;
						img {
							margin-right: 0.6rem;
							width: 1.2rem;
							height: auto;
						}
					`}
				>
					<Image
						src="https://playguide.eu/assets/logo-pentagon.svg"
						alt="Logo du site PlayGuide"
						width="10"
						height="10"
					/>
					Fiche PlayGuide
				</a>
			)}
			<Brand {...{ brand, brandWikidata, brandWikipedia }} />
			<Tags tags={keyValueTags} />
			{wikidata && <Wikidata id={wikidata} />}
			<SimilarNodes node={data} />
			<OsmLinks data={data} />
		</OsmFeatureWrapper>
	)
}
