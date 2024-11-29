 import { useMediaQuery } from 'usehooks-ts'
 
 import { useEffect, useState } from 'react'
 import ModalSheet from './ModalSheet'
 import SideSheet from './SideSheet'
 
 export default function ModalSwitch(props) {
 	const [mode, setMode] = useState('no-js')
 	const test = useMediaQuery('(min-width: 800px)')
 
 	useEffect(() => {
 		setMode(test ? 'desktop' : 'mobile')
 	}, [setMode, test])
 
 	if (mode === 'no-js') return <SideSheet {...props} />
 	if (mode === 'desktop') return <SideSheet {...props} />
 
 	return <ModalSheet {...props} />
 }
 
 /*
 Alternatives : https://github.com/helgastogova/react-stateful-bottom-sheet?ref=hackernoon.com
 https://github.com/helgastogova/react-stateful-bottom-sheet?ref=hackernoon.com
 bof
 
 mieux : https://github.com/plrs9816/slick-bottom-sheet/
 
 https://codesandbox.io/s/framer-motion-bottom-sheet-for-desktop-with-drag-handle-ov8e0o
 
 https://swipable-modal.vercel.app
 */
