global.Image = Image

import carteFacile from 'carte-facile'
import { NextRequest, NextResponse } from 'next/server'
import { Image } from 'canvas'

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const style = searchParams.get('style')
	const json = carteFacile.mapStyle[style]

	return NextResponse.json(json)
}
