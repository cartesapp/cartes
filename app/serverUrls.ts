export const gtfsServerUrl =
	process.env.NEXT_PUBLIC_LOCAL_SERVER === 'true'
		? 'http://localhost:3001'
		: process.env.NEXT_PUBLIC_GTFS_SERVER_URL

export const updateServerUrl =
	process.env.NEXT_PUBLIC_LOCAL_SERVER === 'true'
		? 'http://localhost:3002'
		: process.env.NEXT_PUBLIC_GTFS_SERVER_URL.replace('/gtfs', '/update')

export const pmtilesServerUrl =
	process.env.NEXT_PUBLIC_LOCAL_SERVER === 'true'
		? 'http://localhost:3001'
		: process.env.NEXT_PUBLIC_PMTILES_SERVER_URL

export const motisServerUrl =
	process.env.NEXT_PUBLIC_LOCAL_SERVER === 'true'
		? 'http://localhost:3000'
		: process.env.NEXT_PUBLIC_MOTIS_SERVER_URL

export const photonServerUrl = process.env.NEXT_PUBLIC_PHOTON_SERVER_URL

export const getFetchUrlBase = () => {
	const givenDomain = process.env.NEXT_PUBLIC_DOMAIN
	// Coolify has a similar way to Vercel to inject the domain, but Dokploy has not
	if (givenDomain) return 'https://' + givenDomain

	//	DOKPLOY_DEPLOY_URL: 'preview-cartes-web-master-fpkogn-itwaqo-51-159-213-23.traefik.me',
	const dokployHost = process.env.NEXT_PUBLIC_DOKPLOY_DEPLOY_URL
	const dokployDomain =
		dokployHost && dokployHost !== '' && 'https://' + dokployHost

	const branchUrl =
		dokployDomain ||
		process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL ||
		'http://localhost:8080'
	const isMaster = branchUrl?.includes('-git-master-')
	const domain = isMaster ? process.env.NEXT_PUBLIC_BASE_DOMAIN : branchUrl

	const urlBase =
		process.env.NEXT_PUBLIC_NODE_ENV === 'development'
			? 'http://localhost:8080'
			: domain?.startsWith('http')
			? domain
			: 'https://' + domain

	return urlBase
}

export const isServer = typeof window === 'undefined'

export const analyticsUrl = 'https://cartes.deno.dev'
