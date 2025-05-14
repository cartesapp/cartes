import { NextRequest, NextResponse, userAgent } from 'next/server'

export function middleware(request: NextRequest) {
	const url = request.nextUrl
	const { isBot, browser } = userAgent(request)

	console.log('url ', url.href, url.searchParams.toString())
	console.log('UA isBot ', isBot, ' browser ', browser)

	const response = NextResponse.next()
	return response
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: '/lieux/:path*',
}
