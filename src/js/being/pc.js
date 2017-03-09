import XY from "util/xy.js";
import Being from "./being.js";
import Item from "item/item.js";
import { BLOCKS_MOVEMENT, BLOCKS_LIGHT, BLOCKS_NONE } from "entity.js";
import { ATTACK_1, ATTACK_2, MAGIC_1, MAGIC_2 } from "combat/types.js";
import * as combat from "combat/combat.js";

import * as keyboard from "util/keyboard.js";
import * as actors from "util/actors.js";
import * as pubsub from "util/pubsub.js";
import * as rules from "rules.js";
import * as log from "ui/log.js";
import * as cells from "level/cells.js";
import choice from "ui/choice.js";

let COMBAT_OPTIONS = {
	[ATTACK_1]: 10,
	[ATTACK_2]: 10,
	[MAGIC_1]: 10,
	[MAGIC_2]: 10
};

const TUTORIAL = {
	staircase: false,
	pick: false,
	door: false,
	enemy: false
}

class PC extends Being {
	constructor() {
		super({ch:"@", fg:"#fff", name:"you"});
		this._resolve = null; // end turn
		this.fov = {};

		pubsub.subscribe("topology-change", this);
	}

	describeThe() { return this.toString(); }
	describeA() { return this.toString(); }
	describeIt() { return this.toString(); }
	describeVerb(verb) { return verb; }

	getCombatOption() {
		return ROT.RNG.getWeightedValue(COMBAT_OPTIONS);
	}

	act() {
		log.pause();
		let promise = new Promise(resolve => this._resolve = resolve);

		promise = promise.then(() => keyboard.pop());
		keyboard.push(this);

		return promise;
	}

	handleKeyEvent(e) {
		if (keyboard.isEnter(e)) { return this._activate(this._xy); }

		let dir = keyboard.getDirection(e);
		if (!dir) { return; }

		let modifier = keyboard.hasModifier(e);
		let xy = this._xy.plus(dir)
		if (modifier) {
			this._interact(xy);
		} else {
			this._move(xy);
		}
	}

	handleMessage(message, publisher, data) {
		switch (message) {
			case "topology-change":
				this._updateFOV();
			break;
		}
	}

	adjustStat(stat, diff) {
		super.adjustStat(stat, diff);
		pubsub.publish("status-change");
	}

	die() {
		super.die();
		actors.clear();
		log.pause();
		log.add("Game over! Reload the page to try again...");
	}

	moveTo(xy, level) {
		super.moveTo(xy, level);
		if (!this._xy) { return; }

		this._updateFOV();

		// getEntity not possible, because *we* are standing here :)

		let item = this._level.getItem(this._xy);
		if (item) {
			log.add("%A is lying here.", item);
			return;
		}

		let cell = this._level.getCell(this._xy);
		if (cell instanceof cells.Door) {
			log.add("You pass through %a.", cell);
		} else if (cell instanceof cells.Staircase) {
			log.add("%A is here.", cell);
			if (!TUTORIAL.staircase) {
				TUTORIAL.staircase = true;
				log.add("To use the staircase, press {#fff}Enter{}.");
			}
		}
	}

	_activate(xy) { // pick or enter
		let item = this._level.getItem(xy);
		if (item) { 
			item.pick(this);
			this._resolve();
			return;
		}

		let cell = this._level.getCell(xy);
		if (cell.activate) {
			cell.activate(this);
			this._resolve(); // successful cell activation
		} else {
			log.add("There is nothing you can do here.");
		}
	}

	_interact(xy) {
		let entity = this._level.getEntity(xy);
		if (entity instanceof cells.Door) {
			if (entity.isOpen()) {
				log.add("You close the door.");
				entity.close();
			} else {
				log.add("You open the door.");
				entity.open();
			}
			return this._resolve(); // successful interaction
		}

		log.add("You see %a.", entity);

		if (entity instanceof Being) {
			choice(["aaaa", "bbbb"]);
			return;			
		}

		if (entity instanceof Item) {
			// fixme tutorial
			log.add("To pick it up, move there and press {#fff}Enter{}.");
			return;
		}
	}

	_move(xy) {
		let entity = this._level.getEntity(xy);
		if (entity.blocks >= BLOCKS_MOVEMENT) {
			log.add("You bump into %a.", entity);
			if (entity instanceof cells.Door && !TUTORIAL.door) {
				TUTORIAL.door = true;
				log.add("To interact with stuff, press both a {#fff}modifier key{} (Ctrl, Alt, Shift or Command) and a {#fff}direction key{} (used for movement).");
			}
			return;
		}

		this.moveTo(xy);
		this._resolve(); // successful movement
	}

	_updateFOV() {
		let level = this._level;
		let fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
			return level.getEntity(new XY(x, y)).blocks < BLOCKS_LIGHT;
		});

		let newFOV = {};
		let cb = (x, y, r, amount) => {
			let xy = new XY(x, y);
			newFOV[xy] = xy;
		};
		fov.compute(this._xy.x, this._xy.y, rules.PC_SIGHT, cb);
		this.fov = newFOV;

		pubsub.publish("visibility-change", this, {xy:this._xy});
	}
}

export default new PC();
