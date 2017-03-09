import XY from "util/xy.js";
import Entity, { BLOCKS_MOVEMENT } from "entity.js";
import Inventory from "./inventory.js";
import * as actors from "util/actors.js";

export default class Being extends Entity {
	constructor(visual) {
		super(visual);
		this.blocks = BLOCKS_MOVEMENT;
		this._xy = null;
		this._level = null;
		this.attack = 0;
		this.defense = 0;

		this.inventory = new Inventory();

		this.maxhp = 10;
		this.hp = this.maxhp;
		this.maxmana = 10;
		this.mana = this.maxmana;
	}

	getXY() { return this._xy; }
	getLevel() { return this._level; }

	getAttack() {
		return this.attack; // fixme items
	}

	getDefense() {
		return this.defense; // fixme items
	}

	adjustStat(stat, diff) {
		this[stat] += diff;
		this[stat] = Math.max(this[stat], 0);
		this[stat] = Math.min(this[stat], this[`max${stat}`]);
		if (stat == "hp" && this[stat] == 0) { this.die(); }
	}

	die() {
		let level = this._level;
		let xy = this._xy;

		this.moveTo(null);
		actors.remove(this);
		
		let items = this.inventory.getItems();
		if (items.length > 0) {
			let item = items.random();
			this.inventory.removeItem(item);
			level.setItem(xy, item);
		}
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

	describeIt() {
    	return "it";
	}

	describeVerb(verb) {
	    return `${verb}${verb.charAt(verb.length-1) == "s" || verb == "do" ? "es" : "s"}`;
	}
}

String.format.map.verb = "describeVerb";
String.format.map.it = "describeIt";
