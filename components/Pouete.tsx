 export default function Pouete({ src }) {
 	return (
 		<iframe
 			src={src + '/embed'}
 			className="mastodon-embed"
 			allowFullScreen={true}
 		></iframe>
 	)
 }
