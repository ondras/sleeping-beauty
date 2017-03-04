import * as cells from "level/cells.js";
import pc from "being/pc.js";

const GRASS_1 = new cells.Grass(".");
const GRASS_2 = new cells.Grass(",");
const GRASS_3 = new cells.Grass(";");

const NOISE = new ROT.Noise.Simplex();

function darken(color) {
	if (!color) { return color; }
	return ROT.Color.toRGB(ROT.Color.fromString(color).map(x => x>>1));
}

export default class Memory {
	constructor(level) {
		this._level = level;
		this._memoized = {};
	}

	visualAt(xy) {
		if (this._level.isOutside(xy)) {
			let entity;
			let noise = NOISE.get(xy.x, xy.y);
			if (noise < 0.3) {
				entity = GRASS_1;
			} else if (noise < 0.7) {
				entity = GRASS_2;
			} else {
				entity = GRASS_3;
			}
			return entity.getVisual();
		}

		let fov = pc.getFOV();
		if (xy in fov) {
			let visual = this._level.getEntity(xy).getVisual();
			this._memoize(xy, visual);
			return visual;
		} else if (xy in this._memoized) {
			return this._memoized[xy];
		} else {
			return null;
		}
	}

	_memoize(xy, visual) {
		this._memoized[xy] = {
			ch: visual.ch,
			fg: darken(visual.fg)
		}
	}
}
