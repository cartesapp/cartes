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
 * @param currentBbox - Current bbox coordinates [[lon1, lat1], [lon2, lat2]]
 * @param prevBbox - Previous bbox coordinates [[lon1, lat1], [lon2, lat2]]
 * @param threshold - Shift threshold as a fraction (default: 1/3)
 * @returns boolean indicating if the shift is significant
 */
export const hasBboxShiftedSignificantly = (
	currentBbox,
	prevBbox,
	threshold = 1 / 3
) => {
	if (!prevBbox || !currentBbox) return false

	// Extract coordinates from the bbox format [[lon1, lat1], [lon2, lat2]]
	const [lon1Prev, lat1Prev] = prevBbox[0]
	const [lon2Prev, lat2Prev] = prevBbox[1]
	const [lon1Current, lat1Current] = currentBbox[0]
	const [lon2Current, lat2Current] = currentBbox[1]

	// Calculate width and height of previous bbox
	const prevWidth = Math.abs(lon2Prev - lon1Prev)
	const prevHeight = Math.abs(lat2Prev - lat1Prev)

	// Calculate center points of both bboxes
	const prevCenterX = (lon1Prev + lon2Prev) / 2
	const prevCenterY = (lat1Prev + lat2Prev) / 2
	const currentCenterX = (lon1Current + lon2Current) / 2
	const currentCenterY = (lat1Current + lat2Current) / 2

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
