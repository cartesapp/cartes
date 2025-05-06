/*
 * This file is very important, as it defines what is considered as a safe OpenStreetMap segment !
 * To understand theses choices, check this bible https://wiki.openstreetmap.org/wiki/Key:highway#Paths
 * And explore each tag on the wiki.
 *
 * The aim is to judge what's a safe road for bikes.
 * For now, the algorithm is binary : it's safe or not. We could consider giving weights instead in a future version, but I'm skeptical. I'm not sure at all that in termes of safety and willingness to ride a bike, lanes would be worth 1/4 of a proper cycleway (especially considering, e.g. the risk of being hit by a car door on bike lanes often surrounded on the right by parking spots; often where cars park, etc.).
 *
 * Keep in mind that the aim of this test is not to be exhaustive, as OSM tags are complex, but to cover most (not all) French (and more country one day ?) cities.
 * */

export default (tags) =>
	tags.includes('highway=cycleway') || // the main safe way
	tags.includes('highway=living_street') || // cars are forbidden or limited, in speed, and must give priority to bicycles ; wide enough for good pedestrian - cycles cohabitation
	isVoieVerte(tags) ||
	isSafePathV2Diff(tags)

export const isSafePathV2Diff = (tags) =>
	tags.includes('cyclestreet=yes') ||
	tags.includes('highway=pedestrian') || // pedestrian ways are wide enough to be considered cyclable (contrary to footways and paths, as stated here https://wiki.openstreetmap.org/wiki/Tag:highway%3Dfootway), we believe bikes and pedestrian can safely cohabit
	tags.includes('cycleway=track') || // analysing Bretagne's cycleway=track makes me think it's a good candidate for level 0 safe ways, as they are all (at least slightly with some grass) separated from cars
	((tags.includes('highway=path') || tags.includes('highway=footway')) &&
		(tags.includes('bicycle=designated') || tags.includes('bicycle=yes')) &&
		tags.includes('segregated=yes'))
// these two highway types are narrow : hence we expect bicycles to be allowed AND separated, to avoid infamous bike-pedestrian conflicts
// this could be a controversial move; in practice though, in France, it doesn't represent a massive number of km.

// cycleway=share_busway, cycleway=lane are not considered safe segments
// cycleway=shared_lane is not strong enough, there is no priority given to bikes, it's just a reminder

export const isVoieVerte = (tags) =>
	tags.includes('highway=path') && tags.includes('bicycle=designated')
