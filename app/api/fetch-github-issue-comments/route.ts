const url = (number) =>
	`https://api.github.com/repos/cartesapp/cartes/issues/${number}/comments`
const headers = {
	Authorization: `Bearer ${process.env.GITHUB_CLASSIC_TOKEN}`,
}
export async function GET(request) {
	const requestUrl = new URL(request.url),
		number = requestUrl.searchParams.get('number'),
		numbers = requestUrl.searchParams.get('bulk')

	if (number != null) {
		const request2 = await fetch(url(number), {
			//			cache: 'force-cache',
			headers,
		})

		const json = await request2.json()

		return new Response(JSON.stringify(json))
	}
	if (numbers != null) {
		const result = await Promise.all(
			numbers.map(async (number) => {
				const request2 = fetch(url(number), {
					cache: 'force-cache',
					headers,
				})

				const json = await request2.json()
				return json
			})
		)

		return new Response(JSON.stringify(result))
	}
}
