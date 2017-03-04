import XY from "util/xy.js";
import Entity from "entity.js";
import { BLOCKS_MOVEMENT } from "conf.js";

export default class Being extends Entity {
	constructor(visual) {
		super(visual);
		this._blocks = BLOCKS_MOVEMENT;
		this._xy = null;
		this._level = null;
	}

	act() {
		return Promise.resolve();
	}

	moveBy(dxy) {
		return this.moveTo(this._xy.plus(dxy));
	}

	moveTo(xy, level) {
		this._xy && this._level.setBeing(this._xy, null); // remove from old position

		this._level = level || this._level;
		this._xy = xy;

		this._level.setBeing(this._xy, this); // draw at new position
		
		return this;
	}
}
