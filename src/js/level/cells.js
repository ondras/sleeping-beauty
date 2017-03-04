import Entity from "entity.js";
import { BLOCKS_LIGHT } from "conf.js";

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
	}
}
