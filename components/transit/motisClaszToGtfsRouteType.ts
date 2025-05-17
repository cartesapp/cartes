//route_type to clasz
//https://github.com/motis-project/nigiri/blob/master/src/loader/gtfs/route.cc
//
//clasz to clasz index
//https://github.com/motis-project/nigiri/blob/master/include/nigiri/types.h#L295

// ⚠️  this is not lossless. We're losing information from extended route_types
// by using Motis's clasz. But it saves us a call to our API for each trip

const correspondance = {
	0: 1100,
	1: 101,
	2: 102,
	3: 209,
	4: 105,
	5: 2,
	6: 100,
	7: 401,
	8: 1,
	9: 0,
	10: 3,
	11: 4,
	12: null,
}

export default correspondance
