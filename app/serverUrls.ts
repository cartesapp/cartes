export const gtfsServerUrl =
	process.env.NEXT_PUBLIC_LOCAL_GTFS_SERVER === 'true'
		? 'http://localhost:3001'
		: process.env.NEXT_PUBLIC_GTFS_SERVER_URL

export const pmtilesServerUrl =
	process.env.NEXT_PUBLIC_LOCAL_GTFS_SERVER === 'true'
		? 'http://localhost:3001'
		: process.env.NEXT_PUBLIC_PMTILES_SERVER_URL

export const motisServerUrl =
	process.env.NEXT_PUBLIC_LOCAL_GTFS_SERVER === 'true'
		? 'http://localhost:3000'
		: process.env.NEXT_PUBLIC_MOTIS_SERVER_URL

export const photonServerUrl = process.env.NEXT_PUBLIC_PHOTON_SERVER_URL

export const photonReverseServerUrl =
	process.env.NEXT_PUBLIC_PHOTON_REVERSE_SERVER_URL

export const getFetchUrlBase = () => {
	const branchUrl = process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL
	const isMaster = branchUrl?.includes('-git-master-')
	const domain = isMaster ? process.env.NEXT_PUBLIC_BASE_DOMAIN : branchUrl

	const urlBase =
		process.env.NEXT_PUBLIC_NODE_ENV === 'development'
			? 'http://localhost:8080'
			: 'https://' + domain
	return urlBase
}
