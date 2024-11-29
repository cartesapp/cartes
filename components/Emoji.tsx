 import emojiRegex from 'emoji-regex'
 import openmojis from './openmojis.json' //assert { type: 'json' }
 import replace from 'string-replace-to-array'
 import { Text, Image as ImageStyle } from './EmojiUI'
 
 const regex = emojiRegex()
 
 const url = `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji`
 export const findOpenmoji = (e, black, fileFormat = 'svg') => {
 	const unicode = e.codePointAt(0).toString(16).toUpperCase()
 
 	const found = openmojis[e] || openmojis[e + '️']
 	// for a reason I don't understand, openmoji JSON file contains the variation 16 emoji somtimes... U+FE0F
 
 	const name = found || unicode
 	return (
 		found &&
 		`${url}/${black ? 'black' : 'color'}/${
 			fileFormat === 'svg' ? 'svg' : '72x72'
 		}/${name}.${fileFormat}`
 	)
 }
 
 const sizeEm = 2
 
 const Emoji = ({ e, black, extra, alt, hasText, white, customSizeEm }) => {
 	const useBlack = black || white
 	if (e == null && extra == null) return null
 	if (extra)
 		return (
 			<Image
 				{...{
 					src: `${url}/${useBlack ? 'black' : 'color'}/svg/${extra}.svg`,
 					alt,
 					imageSize: customSizeEm || sizeEm,
 				}}
 			/>
 		)
 
 	const matches = [...e.matchAll(regex)]
 	const imageSize = (customSizeEm || sizeEm) * (1 - (matches.length - 1) / 10)
 
 	const items = replace(e, regex, function (emoji) {
 		const src = findOpenmoji(emoji, useBlack)
 		return <Image {...{ src, alt: alt || emoji, imageSize, white }} key={src} />
 	})
 	if (hasText) return items
 	return <Text>{items}</Text>
 }
 
 const Image = ({ src, alt, imageSize, white }) => (
 	<ImageStyle
 		src={src}
 		alt={alt}
 		$imageSize={imageSize}
 		$white={white}
 		title={alt}
 	/>
 )
 
 export const getEmojiImageUrls = (emojis) =>
 	replace(emojis, regex, function (emoji) {
 		return findOpenmoji(emoji)
 	})
 
 export const emoji = (e) => <Emoji e={e} />
 export default Emoji
