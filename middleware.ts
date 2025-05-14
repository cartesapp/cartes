import { NextRequest, NextResponse, userAgent } from 'next/server'

export function middleware(request: NextRequest) {
	const url = request.nextUrl
	const UA = userAgent(request)

	console.log('url ', url.href, url.searchParams.toString())
	console.log('IsBot ', UA.isBot, ' UA ', UA.ua)

	const { searchParams } = new URL(request.url)

	// Get the 'cat' parameter
	const catParam = searchParams.get('cat')

	// Check if the 'cat' parameter exists
	if (catParam) {
		// Decode the 'cat' parameter
		const decodedCatParam = decodeURIComponent(catParam)

		// Split the decoded parameter by pipe to get individual categories
		const categories = decodedCatParam.split('|')

		// Check if there is more than one category
		if (categories.length > 1) {
			// Get the first category
			const firstCategory = categories[0]

			// Create a new URL with only the first category
			const newUrl = new URL(request.url)
			newUrl.searchParams.set('cat', firstCategory)

			// Redirect to the new URL
			return NextResponse.redirect(newUrl)
		}
	}

	// If there's only one or no 'cat' parameter, continue with the request
	return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: '/lieux/:path*',
}
