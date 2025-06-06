//import { safeRemove } from '@/node_modules/i18next'

export function isIterable<T>(obj: unknown): obj is Iterable<T> {
	return Symbol.iterator in Object(obj)
}
export function capitalise0(name?: string) {
	return name && name[0].toUpperCase() + name.slice(1)
}
export function uncapitalise0(name?: string) {
	return name && name[0].toLowerCase() + name.slice(1)
}

export function parameterize(name?: string) {
	return (
		name &&
		name
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '') //remove accents from letters
			.toLowerCase()
			.replace('œ', 'oe')
			.replace(/[^a-z0-9 -]+/g, ' ') //remove other special characters
			.replace(/[\s ]+/g, '-') //replace spaces with -
			.trim()
	)
}

export const debounce = <F extends (...args: any[]) => void>(
	waitFor: number,
	fn: F
) => {
	let timeoutId: ReturnType<typeof setTimeout>
	return (...args: any[]) => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => fn(...args), waitFor)
	}
}

export const fetcher = (url: RequestInfo) => fetch(url).then((r) => r.json())

export function inIframe(): boolean {
	try {
		return window.self !== window.top
	} catch (e) {
		return true
	}
}

export function softCatch<ArgType, ReturnType>(
	fn: (arg: ArgType) => ReturnType
): (arg: ArgType) => ReturnType | null {
	return function (...args) {
		try {
			return fn(...args)
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn(e)
			return null
		}
	}
}

export function mapOrApply<A, B>(fn: (a: A) => B, x: A): B
export function mapOrApply<A, B>(fn: (a: A) => B, x: Array<A>): Array<B>
export function mapOrApply<A, B>(fn: (a: A) => B, x: A | Array<A>) {
	return Array.isArray(x) ? x.map(fn) : fn(x)
}

export function coerceArray<A>(x: A | Array<A>): Array<A> {
	return Array.isArray(x) ? x : [x]
}

export function getSessionStorage() {
	// In some browsers like Brave, even just reading the variable sessionStorage
	// is throwing an error in the iframe, so we can't do things if sessionStorage !== undefined
	// and we need to wrap it in a try { } catch { } logic
	try {
		return window.sessionStorage
	} catch (e) {
		return undefined
	}
}

export function hash(str: string): number {
	let hash = 0
	let chr
	for (let i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i)
		hash = (hash << 5) - hash + chr
		hash |= 0 // Convert to 32bit integer
	}
	return hash
}

export const sortBy = (f) => (list) =>
	list.sort((a, b) => {
		const fa = f(a),
			fb = f(b)
		return fa < fb ? -1 : fa > fb ? 1 : 0
	})

export const last = (array) => {
	const [lastItem] = array.slice(-1)
	return lastItem
}

export function omit(givenKeys, obj) {
	const keys = [...givenKeys]
	if (!keys.length) {
		return obj
	}
	const { [keys.pop()]: omitted, ...rest } = obj

	return omit(keys, rest)
}

export const pipe =
	(...fns) =>
	(x) =>
		fns.reduce((v, f) => f(v), x)

export const defaultTo = (defaultValue, arg) =>
	arg == null ? defaultValue : arg

export const intersection = (arr1, arr2) => arr1.filter((x) => arr2.includes(x))
export const difference = (arr1, arr2) => arr1.filter((x) => !arr2.includes(x))

export const objectMap = (obj, fn) =>
	Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]))

export const objectMapKeys = (obj, fn) =>
	Object.fromEntries(Object.entries(obj).map(([k, v], i) => [fn(k, v, i), v]))

export const objectMapEntries = (obj, fn, filterBoolean) => {
	const entries = Object.entries(obj).map(([k, v], i) => fn(k, v, i))
	const filteredEntries = filterBoolean ? entries.filter(Boolean) : entries
	return Object.fromEntries(filteredEntries)
}

export const filterMapEntries = (obj, fn) => {
	const entries = Object.entries(obj).filter(([k, v], i) => fn(k, v, i))
	return Object.fromEntries(entries)
}

const getRealIndex = (array, index) =>
	index < 0 ? array.length + index : index

export const replaceArrayIndex = (
	array,
	index,
	value,
	strategy = 'replace'
) => {
	const realIndex = getRealIndex(array, index)

	if (realIndex < 0) return [value]

	const iterator = [...new Array(Math.max(realIndex + 1, array.length))]

	const newArray = iterator.map((_, i) => {
		const v = array[i] || null
		return i === realIndex
			? strategy === 'merge'
				? { ...v, ...value }
				: value
			: v
	})

	console.log('replaceArray', newArray)

	return newArray
}

export const getArrayIndex = (array, index) => array[getRealIndex(array, index)]

export function isIOS() {
	return (
		[
			'iPad Simulator',
			'iPhone Simulator',
			'iPod Simulator',
			'iPad',
			'iPhone',
			'iPod',
		].includes(navigator.platform) ||
		// iPad on iOS 13 detection
		(navigator.userAgent.includes('Mac') && 'ontouchend' in document)
	)
}

export const unique = (myList) => {
	return [...new Set(myList)]
}

export function isLocalStorageAvailable() {
	var test = 'test'
	try {
		localStorage.setItem(test, test)
		localStorage.removeItem(test)
		return true
	} catch (e) {
		return false
	}
}

export function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
