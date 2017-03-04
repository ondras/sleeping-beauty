import XY from "util/xy.js";
import Being from "./being.js";
import * as keyboard from "util/keyboard.js";
import * as map from "ui/map.js"; // fixme zrusit zavislost
import { BLOCKS_MOVEMENT } from "conf.js";

class PC extends Being {
	constructor() {
		super({ch:"@", fg:"#fff"});
		this._resolve = null; // end turn
	}

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
			if (modifier) {
				this._interact(dir);
			} else {
				this._move(dir);
			}
		}
	}

	moveTo(xy, level) {
		super.moveTo(xy, level);
		map.setCenter(xy);
	}

	_interact(dir) {

	}

	_move(dir) {
		let xy = this._xy.plus(dir);
		let entity = this._level.getEntity(xy);
		if (entity.blocks() >= BLOCKS_MOVEMENT) {
			// fixme log
			return;
		}
		this.moveBy(dir);
		this._resolve();
	}
}

export default new PC();
