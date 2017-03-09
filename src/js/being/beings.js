import Being from "./being.js";
import { Gold } from "item/items.js";
import * as ai from "ai.js";
import * as log from "ui/log.js";
import * as rules from "rules.js";

const HERO_RACES = ["dwarven", "halfling", "orcish", "human", "elvish", "noble"];
const HERO_TYPES = ["knight", "adventurer", "hero", "explorer"];
const HERO_CHATS = [
	"Hi there, fellow adventurer!",
	"I wonder how many tower floors are there...",
	"Some monsters in this tower give a pretty hard fight!",
	"Look out for potions, they might save your butt.",
	"A sharp sword is better than a blunt one." // FIXME dalsi
];

class Autonomous extends Being {
	constructor(visual) {
		super(visual);
		this.ai = {
			hostile: true,
			mobile: true
		}
		this.inventory.addItem(new Gold());
	}

	act() {
		return ai.act(this);
	}

	getChat() {
		return null;
	}
}

export class Rat extends Autonomous {
	constructor() {
		super({ch:"r", fg:"#aaa", name:"rat"});
		this.mana = this.maxmana = 0;
		this.hp = this.maxhp = 1;
	}
}

export class Hero extends Autonomous {
	constructor() {
		let race = HERO_RACES.random();
		let type = HERO_TYPES.random();
		let visual = {
			ch: type.charAt(0),
			fg: ROT.Color.toRGB([
				ROT.RNG.getUniformInt(100, 255),
				ROT.RNG.getUniformInt(100, 255),
				ROT.RNG.getUniformInt(100, 255)
			]),
			name: `${race} ${type}`
		};
		super(visual);
		this.sex = 2;
		this.ai.hostile = false;
	}

	getChat() {
		if (this._level.danger == rules.LAST_LEVEL) {
			return "You can do whatever you want here, but beware - no kissing!";
		} else {
			return HERO_CHATS.random();
		}
	}
}
