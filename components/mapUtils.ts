import { useMediaQuery } from 'usehooks-ts'
import { useDimensions } from './react-modal-sheet/hooks'
import { snapPoints } from '@/app/ModalSheet'
import { mediaThreshold } from '@/app/ModalSwitch'

export const goodIconSize = (zoom, factor) => {
	const size = Math.max(0, (factor || 1) * 3.5 * zoom - 16) // I have a doctorate in zoom to icon size study
	return size
}

export const mapLibreBboxToOverpass = (bbox) => [
	bbox[0][1],
	bbox[0][0],
	bbox[1][1],
	bbox[1][0],
]

/**
 * Checks if a bbox has shifted significantly compared to a previous bbox
 * @param currentBbox - Current bbox coordinates [x1, y1, x2, y2]
 * @param prevBbox - Previous bbox coordinates [x1, y1, x2, y2]
 * @param threshold - Shift threshold as a fraction (default: 1/3)
 * @returns boolean indicating if the shift is significant
 */
export const hasBboxShiftedSignificantly = (
	currentBbox,
	prevBbox,
	threshold = 1 / 3
) => {
	if (!prevBbox || !currentBbox) return false

	// Calculate width and height of previous bbox
	const prevWidth = Math.abs(prevBbox[2] - prevBbox[0])
	const prevHeight = Math.abs(prevBbox[3] - prevBbox[1])

	// Calculate center points of both bboxes
	const prevCenterX = (prevBbox[0] + prevBbox[2]) / 2
	const prevCenterY = (prevBbox[1] + prevBbox[3]) / 2
	const currentCenterX = (currentBbox[0] + currentBbox[2]) / 2
	const currentCenterY = (currentBbox[1] + currentBbox[3]) / 2

	// Calculate the shift in X and Y directions
	const shiftX = Math.abs(currentCenterX - prevCenterX)
	const shiftY = Math.abs(currentCenterY - prevCenterY)

	// Check if shift is more than threshold of width or height
	return shiftX > prevWidth * threshold || shiftY > prevHeight * threshold
}

export const useComputeMapPadding = (trackedSnap, searchParams) => {
	const { height, width } = useDimensions()
	const isSideSheet = useMediaQuery(mediaThreshold)
	const sideSheetProbablySmall =
		isSideSheet && !Object.keys(searchParams).length

	if (!isSideSheet) {
		const snapValue = snapPoints[trackedSnap],
			bottom =
				snapValue < 0
					? height + snapValue
					: snapValue < 1
					? height * snapValue
					: snapValue
		const padding = { bottom, left: 0 }
		return padding
	} else {
		const padding = {
			bottom: 0,
			left: sideSheetProbablySmall
				? 0
				: width > 1000
				? 400
				: (45 / 100) * width, //  rough estimate of the footprint in pixel of the left sheet on desktop; should be made dynamic if it ever gets resizable (a good idea)
		}

		console.log('indigo padding', padding)
		return padding
	}
}
