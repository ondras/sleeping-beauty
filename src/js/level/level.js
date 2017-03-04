import XY from "util/xy.js";
import { RATIO } from "conf.js";

import * as cells from "./cells.js";

const ROOM = new cells.Floor();
const CORRIDOR = new cells.Floor();
const DOOR = new cells.Door();
const WALL = new cells.Wall();
const GRASS_1 = new cells.Grass(".");
const GRASS_2 = new cells.Grass(",");
const GRASS_3 = new cells.Grass(";");

export default class Level {
	constructor(radius) {
		this.radius = radius;
		this._beings = {};
		this._items = {};
		this._cells = {};
		this.rooms = [];
		this._noise = new ROT.Noise.Simplex();
	}

	isInside(xy) {
		xy = xy.scale(1, RATIO);
		return xy.norm() < this.radius;
	}

	isOutside(xy) {
		xy = xy.scale(1, RATIO);
		return xy.norm() > this.radius+2;
	}

	visualAt(xy) {
		let cell;
		if (this.isOutside(xy)) {
			let noise = this._noise.get(xy.x, xy.y);
			if (noise < 0.3) {
				cell = GRASS_1;
			} else if (noise < 0.7) {
				cell = GRASS_2;
			} else {
				cell = GRASS_3;
			}
		} else {
			let key = xy.toString();
			cell = this._beings[key] || this._items[key] || this._cells[key] || WALL; 
		}

		return cell.getVisual();
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

	carveCell(xy, cell) {
		this._cells[xy.toString()] = cell;
	}

	carveRoom(room) {
		this.rooms.push(room);
		let xy = new XY();

		for (xy.x=room.lt.x; xy.x<=room.rb.x; xy.x++) {
			for (xy.y=room.lt.y; xy.y<=room.rb.y; xy.y++) {
				this.carveCell(xy, ROOM);
			}
		}
	}

	carveCorridor(xy1, xy2) {
		let diff = xy2.minus(xy1);
		let steps = diff.norm8() + 1;

		for (let i=0; i<=steps; i++) {
			let xy = xy1.lerp(xy2, i/steps).floor();
			this.carveCell(xy, CORRIDOR);
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
				if (this._cells[key] == CORRIDOR) { this.carveCell(xy, DOOR); }
			}
		}
	}
}
