import XY from "util/xy.js";
import Being from "./being.js";
import * as keyboard from "util/keyboard.js";
import * as map from "ui/map.js"; // fixme zrusit zavislost
import * as rules from "rules.js";
import * as pubsub from "util/pubsub.js";
import { BLOCKS_MOVEMENT, BLOCKS_LIGHT, BLOCKS_NONE } from "conf.js";

class PC extends Being {
	constructor() {
		super({ch:"@", fg:"#fff"});
		this._resolve = null; // end turn
		this._blocks = BLOCKS_NONE; // in order to see stuff via FOV...
		this._fov = {};
	}

	getFOV() { return this._fov; }

	act() {
		console.log("player act");
		let promise = new Promise(resolve => this._resolve = resolve);

		promise = promise.then(() => keyboard.pop());
		keyboard.push(this);

		return promise;
	}

	handleKeyEvent(e) {
		let dir = keyboard.getDirection(e);
		let modifier = keyboard.hasModifier(e);
		if (dir) {
			let xy = this._xy.plus(dir)
			if (modifier) {
				this._interact(xy);
			} else {
				this._move(xy);
			}
		}
	}

	moveTo(xy, level) {
		super.moveTo(xy, level);
		this._updateFOV();
	}

	_interact(xy) {
		let cell = this._level.getEntity(xy);
		cell.isOpen() ? cell.close() : cell.open();
		this._updateFOV();
	}

	_move(xy) {
		let entity = this._level.getEntity(xy);
		if (entity.blocks() >= BLOCKS_MOVEMENT) {
			// fixme log
			return;
		}
		this.moveTo(xy);
		this._resolve();
	}

	_updateFOV() {
		let level = this._level;
		let fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
			return level.getEntity(new XY(x, y)).blocks() < BLOCKS_LIGHT;
		});

		let newFOV = {};
		let cb = (x, y, r, amount) => {
			let xy = new XY(x, y);
			newFOV[xy] = xy;
		};
		fov.compute(this._xy.x, this._xy.y, rules.PC_SIGHT, cb);
		this._fov = newFOV;

		pubsub.publish("visibility-change", this, {xy:this._xy});
	}
}

export default new PC();
