import XY from "util/xy.js";
import { RATIO } from "conf.js";

import * as cells from "./cells.js";
import * as pubsub from "util/pubsub.js";

const ROOM = new cells.Floor();
const CORRIDOR = new cells.Floor();
const DOOR = new cells.Door();
const WALL = new cells.Wall();
const GRASS_1 = new cells.Grass(".");
const GRASS_2 = new cells.Grass(",");
const GRASS_3 = new cells.Grass(";");

const NOISE = new ROT.Noise.Simplex();

export function dangerToRadius(danger) {
	return 30; // fixme
}

export default class Level {
	constructor(danger) {
		this.danger = danger;
		this.rooms = [];
		this.start = this.end = null;
		this._beings = {};
		this._items = {};
		this._cells = {};
	}

	isInside(xy) {
		xy = xy.scale(1, RATIO);
		return xy.norm() < dangerToRadius(this.danger);
	}

	isOutside(xy) {
		xy = xy.scale(1, RATIO);
		return xy.norm() > dangerToRadius(this.danger)+2;
	}

	visualAt(xy) {
		let entity;
		if (this.isOutside(xy)) {
			let noise = NOISE.get(xy.x, xy.y);
			if (noise < 0.3) {
				entity = GRASS_1;
			} else if (noise < 0.7) {
				entity = GRASS_2;
			} else {
				entity = GRASS_3;
			}
		} else {
			entity = this.getEntity(xy); 
		}

		return entity.getVisual();
	}

	trim() {
		Object.keys(this._cells).forEach(key => {
			let xy = XY.fromString(key);
			if (!this.isInside(xy)) { delete this._cells[key]; }
		});
	}

	fits(room) {
		let xy = new XY();

		for (xy.x=room.lt.x; xy.x<=room.rb.x; xy.x++) {
			for (xy.y=room.lt.y; xy.y<=room.rb.y; xy.y++) {
				let key = xy.toString();
				if (key in this._cells) { return false; }
			}
		}

		return true;
	}

	getEntity(xy) {
		let key = xy.toString();
		return this._beings[key] || this._items[key] || this._cells[key] || WALL;
	}

	setCell(xy, cell) {
		this._cells[xy.toString()] = cell;
	}

	setBeing(xy, being) {
		this._beings[xy.toString()] = being;
		pubsub.publish("visual-change", this, {xy});
	}

	setItem(xy, item) {
		this._items[xy.toString()] = item;
	}

	carveRoom(room) {
		this.rooms.push(room);
		let xy = new XY();

		for (xy.x=room.lt.x; xy.x<=room.rb.x; xy.x++) {
			for (xy.y=room.lt.y; xy.y<=room.rb.y; xy.y++) {
				this.setCell(xy, ROOM);
			}
		}
	}

	carveCorridor(xy1, xy2) {
		let diff = xy2.minus(xy1);
		let steps = diff.norm8() + 1;

		for (let i=0; i<=steps; i++) {
			let xy = xy1.lerp(xy2, i/steps).floor();
			this.setCell(xy, CORRIDOR);
		}
	}

	carveDoors(room) {
		let xy;
		let size = room.rb.minus(room.lt);

		for (let i=-1;i<=size.x+1;i++) {
			for (let j=-1;j<=size.y+1;j++) {
				if (i == -1 && j == -1) continue;
				if (i == -1 && j == size.y+1) continue;
				if (i == size.x+1 && j == -1) continue;
				if (i == size.x+1 && j == size.y+1) continue;

				if (i > -1 && i <= size.x && j > -1 && j <= size.y) continue;
				xy = room.lt.plus(new XY(i, j));
				let key = xy.toString();
				if (this._cells[key] == CORRIDOR) { this.setCell(xy, DOOR); }
			}
		}
	}
}
