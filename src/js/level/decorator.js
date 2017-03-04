import * as room from "./room.js";

export default function decorate(level) {
	let r1 = room.furthestRoom(level.rooms, level.rooms[0]);
	let r2 = room.furthestRoom(level.rooms, r1);

	level.start = r1.center;
	level.end = r2.center;

	level.rooms.forEach(room => level.carveDoors(room));	
}