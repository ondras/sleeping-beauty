import XY from "util/xy.js";
import { generate } from "./generator.js";
import { dangerToRadius } from "./level.js";
import { Rat, Hero } from "being/beings.js";
import { Gold, Sword, Axe, Shield, HealthPotion, ManaPotion } from "item/items.js";

import * as room from "./room.js";
import * as cells from "./cells.js";
import * as rules from "rules.js";

const levels = {};

function staircaseCallback(danger, start) {
	return function(who) {
		if (!(danger in levels)) { generate(danger); } /* create another level */
		let level = levels[danger];
		level.activate(start ? level.start : level.end, who);
	}
}

function decorateLast(level) {
	let radius = dangerToRadius(level.danger);
	level.start = level.rooms[0].center.minus(new XY(radius-2, 0));

	let bed = level.rooms[0].center.plus(new XY(3, 0));
	level.setCell(bed, new cells.Princess());

	level.setCell(bed.plus(new XY(-1, -1)), new cells.Pillar());
	level.setCell(bed.plus(new XY(+1, -1)), new cells.Pillar());
	level.setCell(bed.plus(new XY(-1, +1)), new cells.Pillar());
	level.setCell(bed.plus(new XY(+1, +1)), new cells.Pillar());

	let xy = new XY();
	for (xy.x = bed.x-3; xy.x <= bed.x+3; xy.x++) {
		for (xy.y = bed.y-3; xy.y <= bed.y+3; xy.y++) {
			if (xy.is(bed)) { continue; }
			if (level.getEntity(xy) != cells.ROOM) { continue; }

			if (xy.dist8(bed) == 1) { // close heroes
				let hero = new Hero();
				hero.ai.mobile = false;
				hero.moveTo(xy.clone(), level);
				continue;
			}

			if (ROT.RNG.getUniform() > 0.5) { continue;  }
			let hero = new Hero(); // remote heroes
			hero.moveTo(xy.clone(), level);
		}
	}
}

function decorateRegular(level) {
	let r1 = room.furthestRoom(level.rooms, level.rooms[0]);
	let r2 = room.furthestRoom(level.rooms, r1);

	level.start = r1.center;
//	level.end = r2.center;
	level.end = level.start.plus({x:1,y:0});

	level.rooms.forEach(room => level.carveDoors(room));	

	let rat = new Rat();
	rat.moveTo(level.start.plus(new XY(3, 0)), level);
//	level.setItem(level.start.plus(new XY(1, 0)), new Sword());
	level.setItem(level.start.plus(new XY(2, 0)), new Axe());
	level.setItem(level.start.plus(new XY(3, 0)), new Shield());
	level.setItem(level.start.plus(new XY(0, 1)), new HealthPotion());
	level.setItem(level.start.plus(new XY(0, 2)), new ManaPotion());

	/* staircase up, all non-last levels */
	let up = new cells.Staircase(true, staircaseCallback(level.danger+1, true));
	level.setCell(level.end, up);

	/* staircase down, when available */
	let d = level.danger-1;
	if (d in levels) {
		let down = new cells.Staircase(false, staircaseCallback(level.danger-1, false));
		level.setCell(level.start, down);
	}
}

export default function decorate(level) {
	levels[level.danger] = level;

	if (level.danger == rules.LAST_LEVEL) {
		decorateLast(level);
	} else {
		decorateRegular(level);
	}

}
