import { debounce } from '../utils/utils'
import { resilientOverpassFetch } from '@/app/overpassFetcher'

function onlyNumbers(str) {
	return /^\d+/.test(str)
}

async function overpassRequest(input, then) {
	// e.g. Nancy 54000
	// ~ because Nancy has postal_code: "54000;54100"
	// ref:INSEE because there is postal_code: "154000" in China
	const overpassRequest = `
	[out:json];
		relation["ref:INSEE"]["postal_code"~"${input}"];
		out body;
>;
out skel qt;
	`

	console.log('indigo overpass', overpassRequest)
	const query = encodeURIComponent(overpassRequest)

	console.log('Query:', query)

	const json = await resilientOverpassFetch(query)

	then(json.elements || [])
}

function detect(input, localSearch, zoom, then, setPostalCodeState) {
	if (!input) return

	if (!onlyNumbers(input) || input.length !== 5) return

	setPostalCodeState(`Code postal détecté. Chargement...`)
	overpassRequest(input, then)
}

const detectCodePostal = debounce(1000, detect)

export default detectCodePostal
