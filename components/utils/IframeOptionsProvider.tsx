 import React, { createContext } from 'react'
 
 export const IframeOptionsContext = createContext({})
 
 const nullDecode = (string) =>
 	string == null ? string : decodeURIComponent(string)
 
 export default function IframeOptionsProvider({ children }) {
 	const iframeIntegratorOptions = Object.fromEntries(
 		[
 			'integratorLogo',
 			'integratorName',
 			'integratorActionUrl',
 			'integratorYoutubeVideo',
 			'integratorActionText',
 		].map((key) => [
 			key,
 			nullDecode(
 				new URLSearchParams(document.location.search).get(key) ?? undefined
 			),
 		])
 	)
 	return (
 		<IframeOptionsContext.Provider value={iframeIntegratorOptions}>
 			{children}
 		</IframeOptionsContext.Provider>
 	)
 }
