import XY from "util/xy.js";
import Being from "./being.js";
import * as keyboard from "util/keyboard.js";
import * as map from "ui/map.js"; // fixme zrusit zavislost

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
		if (dir) {
			this.moveBy(dir);
			this._resolve();
		}
	}

	moveTo(xy, level) {
		super.moveTo(xy, level);
		map.setCenter(xy);
	}
}

export default new PC();
