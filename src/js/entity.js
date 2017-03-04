import { BLOCKS_NONE } from "conf.js";

export default class Entity {
	constructor(visual) {
		this._visual = visual;
		this._blocks = BLOCKS_NONE; 
	}

	getVisual() { return this._visual; }
	blocks() { return this._blocks; }
}
