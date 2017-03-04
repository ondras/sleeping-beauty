import Entity from "entity.js";
import { BLOCKS_NONE, BLOCKS_LIGHT } from "conf.js";

export class Floor extends Entity {
	constructor() {
		super({ch:".", fg:"#888"});
	}
}

export class Wall extends Entity {
	constructor() {
		super({ch:"#", fg:"#888"});
		this._blocks = BLOCKS_LIGHT;
	}
}

export class Grass extends Entity {
	constructor(ch) {
		super({ch, fg:"green"});
	}
}

export class Door extends Entity {
	constructor() {
		super({ch:"/", fg:"saddlebrown"});
		ROT.RNG.getUniform() > 0.5 ? this.open() : this.close();
	}

	isOpen() { return this._open; }

	blocks() {
		return (this._open ? BLOCKS_NONE : BLOCKS_LIGHT);
	}

	close() {
		this._visual.ch = "+";
		this._open = false;
	}

	open() {
		this._visual.ch = "/";
		this._open = true;
	}
}
