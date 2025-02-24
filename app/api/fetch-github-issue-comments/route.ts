const url = (number) =>
	`https://api.github.com/repos/cartesapp/cartes/issues/${number}/comments`
const headers = {
	Authorization: `Bearer ${process.env.GITHUB_CLASSIC_TOKEN}`,
}
export async function GET(request) {
	const requestUrl = new URL(request.url),
		number = requestUrl.searchParams.get('number')
	const request2 = await fetch(url(number), {
		headers,
	})

	const json = await request2.json()

	return new Response(JSON.stringify(json))
}
