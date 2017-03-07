import XY from "util/xy.js";
import Entity from "entity.js";
import * as log from "ui/log.js";

export default class Item extends Entity {
	constructor(type, visual) {
		super(visual);
		this._type = type;
	}

	getType() { return this._type; }

	pick(who) {
		who.getLevel().setItem(who.getXY(), null);
		log.add("You pick up %the.", this);
	}
}

export class Drinkable extends Item {
	pick(who) {
		who.getLevel().setItem(who.getXY(), null);
		log.add("You drink %the.", this);
	}
}

export class Wearable extends Item {
	pick(who) {
		super.pick(who);

		let other = who.inventory.getItemByType(this._type);
		if (other) {
			who.inventory.removeItem(other);
			who.getLevel().setItem(who.getXY(), other);
			log.add("You drop %the.", other);
		}

		who.inventory.addItem(this);
	}
}

