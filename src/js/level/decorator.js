import * as room from "./room.js";
import * as cells from "./cells.js";
import XY from "util/xy.js";
import { generate } from "./generator.js";
import { Rat } from "being/enemy.js";
import { Gold, Sword, Axe, Shield, HealthPotion, ManaPotion } from "item/items.js";

const levels = {};

function staircaseCallback(danger, start) {
	return function(who) {
		if (!(danger in levels)) { generate(danger); } /* create another level */
		let level = levels[danger];
		level.activate(start ? level.start : level.end, who);
	}
}

export default function decorate(level) {
	levels[level.danger] = level;

	let r1 = room.furthestRoom(level.rooms, level.rooms[0]);
	let r2 = room.furthestRoom(level.rooms, r1);

	level.start = r1.center;
	level.end = r2.center;
//	level.end = level.start.plus({x:1, y:0});

	level.rooms.forEach(room => level.carveDoors(room));	

	let rat = new Rat();
	rat.moveTo(level.start.plus(new XY(3, 0)), level);
	level.setItem(level.start.plus(new XY(1, 0)), new Sword());
	level.setItem(level.start.plus(new XY(2, 0)), new Axe());
	level.setItem(level.start.plus(new XY(3, 0)), new Shield());
	level.setItem(level.start.plus(new XY(0, 1)), new HealthPotion());
	level.setItem(level.start.plus(new XY(0, 2)), new ManaPotion());

	/* staircase up, always */
	let up = new cells.Staircase(true, staircaseCallback(level.danger+1, true));
	level.setCell(level.end, up);

	/* staircase down, only when available */
	let d = level.danger-1;
	if (d in levels) {
		let down = new cells.Staircase(false, staircaseCallback(level.danger-1, false));
		level.setCell(level.start, down);
	}
}
