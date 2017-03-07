import Being from "./being.js";
import * as ai from "ai.js";

class Enemy extends Being {
	constructor(visual) {
		super(visual);
	}

	act() {
		return ai.actEnemy(this);
	}
}

export class Rat extends Enemy {
	constructor() {
		super({ch:"r", fg:"gray", name:"rat"});
	}
}
