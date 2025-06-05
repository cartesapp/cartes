/**
 * Transforms a GeoJSON point to a rectangular polygon with a specified aspect ratio.
 * @param {Object} point - The GeoJSON point.
 * @param {number} distance - The distance from the point to the edges of the rectangle (half the width).
 * @param {number} aspectRatio - The aspect ratio of the rectangle (width to height).
 * @returns {Object} - The GeoJSON polygon representing the rectangle.
 */
export function pointToRectangle(point, distance, aspectRatio) {
  // Extract coordinates from the point
  const [lon, lat] = point.geometry.coordinates

  // Calculate the width and height of the rectangle
  const width = distance * 2
  const height = width / aspectRatio

  // Calculate the coordinates of the rectangle's corners
  const halfWidth = width / 2
  const halfHeight = height / 2

  const north = lat + halfHeight / 111111 // Approximate conversion from meters to degrees
  const south = lat - halfHeight / 111111
  const east = lon + halfWidth / (111111 * Math.cos((lat * Math.PI) / 180)) // Adjust for longitude
  const west = lon - halfWidth / (111111 * Math.cos((lat * Math.PI) / 180))

  // Create the rectangle polygon
  const rectangle = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [west, north],
          [east, north],
          [east, south],
          [west, south],
          [west, north], // Close the polygon
        ],
      ],
    },
    properties: {},
  }

  return rectangle
}

// This is very scientific haha
const latDifferenceOfRennes = 0.07,
  lonDifferenceOfRennes = 0.15,
  latDiff = latDifferenceOfRennes / 2,
  lonDiff = lonDifferenceOfRennes / 2

export const computeBbox = ({ lat, lon, factor = 2 }) => [
  lat - latDiff / factor,
  lon - lonDiff / factor,
  lat + latDiff / factor,
  lon + lonDiff / factor,
]
