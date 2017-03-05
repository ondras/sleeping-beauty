export const BLOCKS_NONE = 0;
export const BLOCKS_MOVEMENT = 1;
export const BLOCKS_LIGHT = 2;

export default class Entity {
	constructor(visual) {
		this._visual = visual;
		this._blocks = BLOCKS_NONE; 
	}

	getVisual() { return this._visual; }
	blocks() { return this._blocks; }
	toString() { return this._visual.ch; }
}
