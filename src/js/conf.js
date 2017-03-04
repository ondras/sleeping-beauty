import XY from "util/xy.js";

export const RATIO = 1.6;

export const BLOCKS_NONE = 0;
export const BLOCKS_MOVEMENT = 1;
export const BLOCKS_LIGHT = 2;

export const DIRS = [
	new XY(-1, -1),
	new XY( 0, -1),
	new XY( 1, -1),
	new XY( 1,  0),
	new XY( 1,  1),
	new XY( 0,  1),
	new XY(-1,  1),
	new XY(-1,  0)
];
