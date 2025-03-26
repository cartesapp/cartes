/* I have found no easy to use source to convert a feature's OSM tags to the
best icon file describing it

So let's move on with an imperfect solution. We won't reinvent the wheel, but
use one of OSMApp, OSMand, OrganicMaps solutions.

This mapping https://github.com/openmaptiles/openmaptiles/blob/1614a46/layers/poi/poi.yaml#L18 towards these icons https://github.com/zbycz/osmapp/tree/7c3baf637769ee9d6b0e873085eda9dce922c84f/public/icons were not updated since 3 years

This repo doesn't have an icon for beach, for instance ! https://github.com/gravitystorm/openstreetmap-carto/tree/master/symbols

No amenity = pub here https://github.com/gmgeo/osmic but there is "pub" without the amenity tag.

Thus we decided to chose Osmand

Run this file with `deno run --allow-net app/icons/fetch.ts`
*/

import { bash, BashError } from 'https://deno.land/x/bash/mod.ts'

const shouldDownload = Deno.env.get('DO_DOWNLOAD')

if (!shouldDownload) {
	console.log(
		'Not downloading icons on each bun install except if production deployment on a stateless server'
	)
	process.exit(0)
}

const downloadCommand = `curl -L https://github.com/osmandapp/OsmAnd-resources/tarball/master/ > osmand-resources.tar.gz`

try {
	console.log('Will download Github folder as tarball')
	const tarball = await bash(downloadCommand)
	console.log('Github folder download as tarball')
	const extract = await bash(
		`rm -rf public/osmand-icons && mkdir public/osmand-icons && tar -xzvf osmand-resources.tar.gz -C public/osmand-icons --strip-components=1 --wildcards osman*/icons/svg/`
	)

	const newLastUpdateDate = new Date().toISOString().split('T')[0]
	await bash(
		`echo "${newLastUpdateDate}" > public/osmand-icons/last-update-date.txt`
	)
} catch (error) {
	if (error instanceof BashError) {
		console.error(error.message)
	}
}

// This scripts relies on this file that contains all icon names
const req = await fetch(
	'https://raw.githubusercontent.com/osmandapp/OsmAnd-resources/master/icons/tools/sortfiles.sh'
)
const text = await req.text()

const results = text
	.split('\n')
	.filter((el) => el.match(/icon_alias\s([A-z]|_)+(\s([A-z]|_)+)?/))
	.map((el) => el.split('#')[0].trimEnd()) // they can have comments to end the line
	.filter((el) => el.length > 0)

const iconDirectories = await listDirectory(
	'osmandapp',
	'OsmAnd-resources',
	'icons/svg'
)

//console.log('cyan', iconDirectories)
const iconUrls = results.map((el) => {
	const [, one, two] = el.split(/\s/)

	const sortedDirectories = iconDirectories.sort((a, b) => b.length - a.length)

	// icon_alias sustenance food_fastfood
	// icon_alias amenity_fast_food food_fastfood
	// icon_alias amenity_food_court food_food_court
	// icon_alias man_made_water_well food_water_well
	// icon_alias topo_water_well topo_water_water_well

	const directory = sortedDirectories.find((d) => two.startsWith(d + '_')), // there can be the dirs topo and topo_water with icon topo/water. Hence always select the longest dir first
		path = two
			.split(directory + '_')
			.slice(1)
			.join('')

	const url = directory + `/` + path + '.svg'
	return [one, url]
})

const useThisUrlStartForInstance = `https://cdn.jsdelivr.net/gh/osmandapp/OsmAnd-resources/icons/svg/`

await Deno.writeTextFile('./app/icons/icons.json', JSON.stringify(iconUrls))

console.log('Icons file')
//console.log(iconUrls)

const headers = {
	Authorization: `Bearer ${Deno.env.get('GITHUB_CLASSIC_TOKEN')}`,
}
async function listDirectory(user, repo, directory) {
	const url = `https://api.github.com/repos/${user}/${repo}/git/trees/master`
	directory = directory.split('/').filter(Boolean)
	const dir = await directory.reduce(
		async (acc, dir) => {
			const { url } = await acc
			const list = await fetch(url, { headers }).then((res) => res.json())
			console.log('update-icons github direction list', list)
			return list.tree.find((node) => node.path === dir)
		},
		{ url }
	)
	if (dir) {
		const list = await fetch(dir.url).then((res) => res.json())
		return list.tree.map((node) => node.path)
	}
}

function isMoreThanOneWeekFromNow(dateString) {
	// Parse the given date string into a Date object
	const givenDate = new Date(dateString)

	// Get the current date
	const currentDate = new Date()

	// Calculate the difference in time (milliseconds)
	const timeDifference = givenDate - currentDate

	// Convert the time difference to days
	const daysDifference = timeDifference / (1000 * 60 * 60 * 24)

	// Check if the difference is more than 7 days
	return daysDifference > 7
}
