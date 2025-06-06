import Page from './Page'
import { description, title } from './Page'

export const metadata: Metadata = {
	title,
	description,
}
export default async function () {
	return <Page />
}
