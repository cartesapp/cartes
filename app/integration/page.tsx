import { Metadata } from 'next'
import { description } from '../layout'
import Page, { title } from './Page'

export const metadata: Metadata = {
	title,
	description,
}

export default function () {
	return <Page />
}

// https://jhildenbiddle.github.io/css-device-frames/#/
