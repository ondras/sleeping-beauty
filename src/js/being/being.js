import XY from "util/xy.js";
import Entity, { BLOCKS_MOVEMENT } from "entity.js";
import * as actors from "util/actors.js";

export default class Being extends Entity {
	constructor(visual) {
		super(visual);
		this.blocks = BLOCKS_MOVEMENT;
		this._xy = null;
		this._level = null;
		this._hp = 10;
	}

	getXY() { return this._xy; }
	getLevel() { return this._level; }
	isAlive() { return (this._hp > 0); }

	damage(amount) {
		if (this._hp == 0) { return; }
		this._hp = Math.max(0, this._hp-amount);
		if (this._hp == 0) { this.die(); }
	}
	
	die() {
		this.moveTo(null);
		actors.remove(this);
		// fixme drop stuff?
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

		this._xy && this._level.setBeing(this._xy, this); // draw at new position
		
		return this;
	}
}
