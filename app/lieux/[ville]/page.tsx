import { getCategories } from '@/components/categories'
import Annuaire from './Annuaire'
import { capitalise0 } from '@/components/utils/utils'

export async function generateMetadata(
	props: Props,
	parent: ResolvingMetadata
): Promise<Metadata> {
	// read route params
	const { ville } = await props.params
	const searchParams = await props.searchParams

	const [categoryKeys, categories] = getCategories(searchParams)
	const categoryNames = categories.map((c) => c.name)

	const city = decodeURIComponent(ville)

	if (!categoryKeys?.length)
		return {
			title: `Annuaire des lieux et commerces de ${city} - Cartes`,
			description: `Parcourez les lieux et commerces de la commune de ${city} et affichez-les sur une carte`,
		}

	return {
		title: `${capitalise0(categoryNames.join(', '))} ${city} - Cartes`,
		description: `Parcourez les ${categoryNames.join(
			', '
		)} de la commune de ${city} et affichez-les sur une carte`,
	}
}

export default async function (props) {
	const params = await props.params
	const searchParams = await props.searchParams

	return <Annuaire params={params} searchParams={searchParams} />
}
