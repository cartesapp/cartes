import * as Sentry from '@sentry/nextjs'

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		await import('./sentry.server.config')
	}

	if (process.env.NEXT_RUNTIME === 'edge') {
		await import('./sentry.edge.config')
	}

	process.env.NEXT_PUBLIC_DOKPLOY_DEPLOY_URL = process.env.DOKPLOY_DEPLOY_URL
}

export const onRequestError = Sentry.captureRequestError
