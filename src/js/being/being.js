import XY from "util/xy.js";
import Entity, { BLOCKS_MOVEMENT } from "entity.js";
import * as actors from "util/actors.js";

export default class Being extends Entity {
	constructor(visual) {
		super(visual);
		this.blocks = BLOCKS_MOVEMENT;
		this._xy = null;
		this._level = null;

		this.maxhp = 10;
		this.hp = this.maxhp;
		this.maxmana = 10;
		this.mana = this.maxmana;
		this.mana = 0;
	}

	getXY() { return this._xy; }
	getLevel() { return this._level; }

	adjustStat(stat, diff) {
		this[stat] += diff;
		this[stat] = Math.max(this[stat], 0);
		this[stat] = Math.min(this[stat], this[`max${stat}`]);
		if (stat == "hp" && this[stat] == 0) { this.die(); }
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
