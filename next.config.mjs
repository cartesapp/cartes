import { withSentryConfig } from '@sentry/nextjs'
import { withContentlayer } from 'next-contentlayer2'
import createMDX from '@next/mdx'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
import { withYak } from 'next-yak/withYak'
import CopyPlugin from 'copy-webpack-plugin'

import mdxOptions from './mdxOptions.mjs'

const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: false,
	experimental: {
		reactCompiler: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'serveur.cartes.app',
			},
		],
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		// !! WARN !!
		ignoreBuildErrors: true,
	},
	async rewrites() {
		return [
			{ source: '/feed.xml', destination: '/_next/static/feed.xml' },
			{ source: '/lieu', destination: '/' },
		]
	},
	async redirects() {
		return [
			{
				source: '/prez',
				destination: '/presentation/state-of-the-map-2024',
				permanent: false,
			},
			{
				source: '/nord',
				destination: '/boussole',
				permanent: false,
			},
			{
				source: '/elections-legislatives-2024',
				destination: '/?style=elections',
				permanent: false,
			},
			{
				source: '/elections-legislatives-2024/premier-tour',
				destination: '/?style=elections',
				permanent: false,
			},
		]
	},
	webpack: (config, options) => {
		config.module.rules.push({
			test: /\.ya?ml$/,
			use: 'yaml-loader',
		})
		config.module.rules.push({ test: /\.mp3$/, type: 'asset/resource' })
		config.module.rules.push({
			test: /\.csv$/,
			loader: 'csv-loader',
			options: {
				dynamicTyping: true,
				header: true,
				skipEmptyLines: true,
			},
		})

		const fileLoaderRule = config.module.rules.find((rule) =>
			rule.test?.test?.('.svg')
		)

		config.module.rules.push(
			{
				...fileLoaderRule,
				test: /\.svg$/i,
				resourceQuery: {
					not: [...fileLoaderRule.resourceQuery.not, /component/],
				},
			},

			{
				test: /\.svg$/i,
				issuer: fileLoaderRule.issuer,
				resourceQuery: /component/,
				use: ['@svgr/webpack'],
			}
		)

		config.resolve.alias = {
			...config.resolve.alias,
			//https://github.com/Turfjs/turf/issues/2200
			rbush: path.resolve(__dirname, '/node_modules/rbush/rbush.js'),
		}

		config.plugins.push(
			new CopyPlugin({
				patterns: [
					{
						to: path.resolve(__dirname, 'public/indoorequal'),
						from: path.resolve(
							__dirname,
							'node_modules/maplibre-gl-indoorequal/sprite'
						),
					},
				],
			})
		)

		return config
	},
	pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({ options: mdxOptions })

export default withSentryConfig(
	withYak(withContentlayer(withMDX(nextConfig))),

	{
		// For all available options, see:
		// https://github.com/getsentry/sentry-webpack-plugin#options

		org: 'cartes-nh',
		project: 'javascript-nextjs',

		// Only print logs for uploading source maps in CI
		silent: !process.env.CI,

		// For all available options, see:
		// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

		// Upload a larger set of source maps for prettier stack traces (increases build time)
		widenClientFileUpload: true,

		// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
		// This can increase your server load as well as your hosting bill.
		// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
		// side errors will fail.
		tunnelRoute: '/monitoring',

		// Hides source maps from generated client bundles
		hideSourceMaps: true,

		// Automatically tree-shake Sentry logger statements to reduce bundle size
		disableLogger: true,

		// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
		// See the following for more information:
		// https://docs.sentry.io/product/crons/
		// https://vercel.com/docs/cron-jobs
		automaticVercelMonitors: true,
	}
)
