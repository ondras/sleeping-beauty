import Item, {Wearable} from "./item.js";
import * as status from "ui/status.js";

window.ss = status;

export class Gold extends Item {
	constructor() {
		super("gold", {ch:"$", fg:"#fc0", name:"golden coin"});
		this.amount = 1;
	}

	pick(who) {
		super.pick(who);

		let other = who.inventory.getItemByType(this._type);
		if (other) {
			other.amount++;
		} else {
			who.inventory.addItem(this);
		}

		status.update();
	}
}

export class Sword extends Wearable {
	constructor() {
		super("weapon", {ch:"(", fg:"#eef", name:"sword"});
	}
}

export class Axe extends Wearable {
	constructor() {
		super("weapon", {ch:")", fg:"#eef", name:"axe"});
	}
}

export class Shield extends Wearable {
	constructor() {
		super("shield", {ch:"]", fg:"#eef", name:"shield"});
	}
}
