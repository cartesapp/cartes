import icons from '@/app/icons/icons.json'

export async function GET(request) {
	const requestUrl = new URL(request.url),
		k = requestUrl.searchParams.get('k'),
		v = requestUrl.searchParams.get('v')

	const json = icons.find(([key]) => key === k + '_' + v || key === v)

	if (!json) return Response.json({ error: 'No icon found' }, { status: 404 })

	return Response.json(json)
}
