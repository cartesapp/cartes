import { categories } from '@/components/categories'
import colors from '@/app/categoryColors.yaml'

export async function GET(request: Request) {
	const json = categories.map((c) => ({
		...c,
		color: colors[c.category],
	}))
	return Response.json(json, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		},
	})
}
