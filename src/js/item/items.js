import Item, {Wearable, Drinkable} from "./item.js";
import * as pubsub from "util/pubsub.js";
import * as log from "ui/log.js";
import * as rules from "rules.js";

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

		pubsub.publish("status-change");
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

export class HealthPotion extends Drinkable {
	constructor() {
		super(rules.POTION_HP, {ch:"!", fg:"#e00", name:"health potion"});
	}

	pick(who) {
		super.pick(who);
		if (who.maxhp == who.hp) {
			log.add("Nothing happens.");
		} else if (who.maxhp - who.hp <= this._strength) {
			log.add("You are completely healed.");
		} else {
			log.add("Some of your health is restored.");
		}
		who.adjustStat("hp", this._strength);
	}
}

export class ManaPotion extends Drinkable {
	constructor() {
		super(rules.POTION_MANA, {ch:"!", fg:"#00e", name:"mana potion"});
	}

	pick(who) {
		super.pick(who);
		if (who.maxmana == who.mana) {
			log.add("Nothing happens.");
		} else if (who.maxmana - who.mana <= this._strength) {
			log.add("Your mana is completely refilled.");
		} else {
			log.add("Some of your mana is refilled.");
		}
		who.adjustStat("mana", this._strength);
	}
}
