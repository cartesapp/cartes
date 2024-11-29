 import React, {
 	type TouchEvent,
 	type UIEvent,
 	forwardRef,
 	useState,
 	useEffect,
 	useRef,
 } from 'react'
 
 import { useSheetScrollerContext } from './context'
 import { type SheetScrollerProps } from './types'
 import { isTouchDevice } from './utils'
 import styles from './styles'
 
 const SheetScroller = forwardRef<any, SheetScrollerProps>(
 	(
 		{ draggableAt = 'top', children, style, className = '', snap, ...rest },
 		ref
 	) => {
 		const sheetScrollerContext = useSheetScrollerContext()
 
 		const [dragging, setDragging] = useState(false)
 
 		function determineDragState(element: HTMLDivElement) {
 			const { scrollTop, scrollHeight, clientHeight } = element
 			const isScrollable = scrollHeight > clientHeight
 
 			if (!isScrollable) return
 
 			const isAtTop = scrollTop <= 0
 			const isAtBottom = scrollHeight - scrollTop === clientHeight
 
 			const shouldEnable =
 				(draggableAt === 'top' && isAtTop) ||
 				(draggableAt === 'bottom' && isAtBottom) ||
 				(draggableAt === 'both' && (isAtTop || isAtBottom))
 
 			if (shouldEnable) {
 				sheetScrollerContext.setDragEnabled()
 			} else {
 				sheetScrollerContext.setDragDisabled()
 			}
 		}
 
 		function onScroll(e: UIEvent<HTMLDivElement>) {
 			console.log('sheet', e)
 			determineDragState(e.currentTarget)
 		}
 
 		function onTouchStart(e: TouchEvent<HTMLDivElement>) {
 			determineDragState(e.currentTarget)
 		}
 
 		// Since pan-down is not supported by firefox or safari, we need to know the
 		// move direction
 		const y = useRef(0)
 		const lastY = y.current
 		const [yDirection, setYDirection] = useState(null)
 
 		function onTouchMove(e: TouchEvent<HTMLDivElement>) {
 			var currentY = e.touches[0].clientY
 			if (currentY > lastY) {
 				// moved down
 				console.log(' moved down')
 				setYDirection('down')
 			} else if (currentY < lastY) {
 				// moved up
 				console.log('moved up')
 				setYDirection('up')
 			}
 			y.current = currentY
 		}
 
 		const scrollProps = isTouchDevice()
 			? { onScroll, onTouchStart, onTouchMove }
 			: undefined
 
 		const disableDrag = sheetScrollerContext.disableDrag,
 			touchAction = disableDrag
 				? 'pan-y'
 				: snap === 0 && yDirection === 'up'
 				? // should use pan-down here but neither safari nor firefox support it...
 				  'pan-y'
 				: 'none'
 		/*
 		console.log(
 			'zop',
 			sheetScrollerContext.disableDrag ? 'disabledDrag' : 'enabledDrag',
 			snap,
 			touchAction,
 			yDirection
 		)*/
 		return (
 			<div
 				{...rest}
 				ref={ref}
 				className={`react-modal-sheet-scroller ${className}`}
 				style={{
 					...styles.scroller,
 					...style,
 					touchAction,
 				}}
 				{...scrollProps}
 			>
 				{children}
 			</div>
 		)
 	}
 )
 
 SheetScroller.displayName = 'SheetScroller'
 
 export default SheetScroller
