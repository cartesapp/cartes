import { Sheet, SheetRef } from '@/components/react-modal-sheet'
import { useCallback, useEffect, useRef, useState } from 'react'
import { styled } from 'next-yak'
import Content from './Content'
import ModalSheetReminder from './ModalSheetReminder'
import { useDimensions } from '@/components/react-modal-sheet/hooks'
import { useLocalStorage } from 'usehooks-ts'
import { css } from 'next-yak'

export const snapPoints = [-50, 0.5, 150, 100, 0],
	initialSnap = 3

export default function ModalSheet(props) {
	const { osmFeature, styleChooser, searchParams } = props
	const { trackedSnap, setTrackedSnap } = props

	const [tutorials, setTutorials] = useLocalStorage(
		'tutorials',
		{},

		{
			initializeWithValue: false,
		}
	)

	const [isOpen, setOpen] = useState(false)
	const [disableDrag, setDisableDrag] = useState(false)

	const bookmarksView = searchParams.favoris === 'oui'

	const ref = useRef<SheetRef>()
	const setSnap = useCallback(
		(i: number, fromComponent) => {
			console.log('snapp to ' + i, ' from component ', fromComponent)

			/*
 			if (i < snapPoints.length - 1) setOpen(true)
 			setTimeout(() => {
 			}, 1000)
 			*/

			ref.current?.snapTo(i)
		},
		[ref, setOpen]
	)

	// Handle virtual keyboard pop on PlaceSearch input click
	// ---------------------
	// Not sure if it's a bug of react-moda-sheet or a desired behavior,
	// but resizing the window height when snapPoints makes the sheet lose its
	// current snap and go back to the initialSnap without overwriting the current
	// snap. On mobile firefox this is problematic : the virtual keyboard changes
	// height which makes the sheet lose its desired snap
	const { height } = useDimensions()
	useEffect(() => {
		setSnap(Math.max(trackedSnap - 1, 0), 'inside')
		setSnap(trackedSnap, 'inside')
		//setTimeout(() => setSnap(trackedSnap, 'inside'), 2000)
	}, [height])

	useEffect(() => {
		// https://github.com/Temzasse/react-modal-sheet/issues/146
		setTimeout(() => setOpen(true), 1)
	}, [setOpen])

	const clickedCirco = searchParams.id_circo != null
	// not sure this works. It's supposed to make the modal pop when clicks
	useEffect(() => {
		if (!osmFeature && !styleChooser && !bookmarksView && !clickedCirco) return

		setOpen(true)
		const timeout = () => {
			setSnap(1)
		}
		setTimeout(timeout, 400)
		return () => {
			clearTimeout(timeout)
		}
	}, [setSnap, osmFeature, styleChooser, bookmarksView, clickedCirco])

	return (
		<>
			{!isOpen && <ModalSheetReminder setOpen={setOpen} />}
			<CustomSheet
				ref={ref}
				isOpen={isOpen}
				onClose={() => {
					console.log('Modal closed')
					if (!tutorials.introduction)
						setTutorials((tutorials) => ({ ...tutorials, introduction: true }))
					setOpen(false)
				}}
				snapPoints={snapPoints}
				initialSnap={initialSnap}
				mountPoint={props.containerRef.current}
				onSnap={(snapIndex) => {
					console.log('> Modal : Current snap point index:', snapIndex)
					setTrackedSnap(snapIndex)
				}}
			>
				<Sheet.Container
					css={css`
						background-color: var(--lightestColor2) !important;
					`}
				>
					<Sheet.Header
						css={css`
							span {
								background-color: var(--lighterColor) !important;
							}
						`}
					/>
					<Sheet.Content disableDrag={disableDrag}>
						<Sheet.Scroller draggableAt="both" snap={trackedSnap}>
							<SheetContentWrapper>
								<Content
									{...props}
									sideSheet={false}
									snap={trackedSnap}
									setSnap={setSnap}
									openSheet={setOpen}
									setDisableDrag={setDisableDrag}
								/>
							</SheetContentWrapper>
						</Sheet.Scroller>
					</Sheet.Content>
				</Sheet.Container>
				<Sheet.Backdrop />
			</CustomSheet>
		</>
	)
}
const SheetContentWrapper = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 0rem 0.6rem;
`
const CustomSheet = styled(Sheet)`
	.react-modal-sheet-backdrop {
		background-color: unset !important;
	}
	.react-modal-sheet-container {
		/* custom styles */
	}
	.react-modal-sheet-header {
		/* custom styles */
		height: 1.2rem !important;
	}
	.react-modal-sheet-drag-indicator {
		/* custom styles */
	}
	.react-modal-sheet-content {
		/* custom styles */
	}
	color: var(--darkestColor);
`
