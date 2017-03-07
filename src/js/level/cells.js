import Entity, { BLOCKS_NONE, BLOCKS_LIGHT } from "entity.js";
import * as log from "ui/log.js";

export class Floor extends Entity {
	constructor() {
		super({ch:".", fg:"#aaa", name:"stone floor"});
	}
}

export class Wall extends Entity {
	constructor() {
		super({ch:"#", fg:"#666", name:"solid wall"});
		this._blocks = BLOCKS_LIGHT;
	}
}

export class Grass extends Entity {
	constructor(ch) {
		super({ch, fg:"#693"});
	}
}

export class Tree extends Entity {
	constructor() {
		super({ch:"T", fg:"green"});
	}
}

export class Door extends Entity {
	constructor() {
		super({ch:"/", fg:"#963"});
		ROT.RNG.getUniform() > 0.5 ? this.open() : this.close();
	}

	isOpen() { return this._open; }

	blocks() {
		return (this._open ? BLOCKS_NONE : BLOCKS_LIGHT);
	}

	close() {
		this._visual.ch = "+";
		this._open = false;
		this._visual.name = "closed door";
	}

	open() {
		this._visual.ch = "/";
		this._open = true;
		this._visual.name = "open door";
	}
}

export class Staircase extends Entity {
	constructor(up, callback) {
		let ch = (up ? "<" : ">");
		let fg = "#aaa";
		let name = `staircase leading ${up ? "up" : "down"}`;
		super({ch, fg, name});

		this._callback = callback;
	}

	activate(who) {
		log.add("You enter the staircase...");
		this._callback(who);
	}
}

export const ROOM = new Floor();
export const CORRIDOR = new Floor();
export const WALL = new Wall();
