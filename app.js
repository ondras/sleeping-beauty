(function () {
'use strict';

class XY {
	static fromString(str) {
		let numbers = str.split(",").map(Number);
		return new this(...numbers);
	}

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	clone() {
		return new XY(this.x, this.y);
	}

	toString() {
		return `${this.x},${this.y}`;
	}

	is(xy) {
		return (this.x==xy.x && this.y==xy.y);
	}

	norm8() {
		return Math.max(Math.abs(this.x), Math.abs(this.y));
	}

	norm4() {
		return Math.abs(this.x) + Math.abs(this.y);
	}

	norm() {
		return Math.sqrt(this.x*this.x+this.y*this.y);
	}

	dist8(xy) {
		return this.minus(xy).norm8();
	}

	dist4(xy) {
		return this.minus(xy).norm4();
	}

	dist(xy) {
		return this.minus(xy).norm();
	}

	lerp(xy, frac) {
		let diff = xy.minus(this);
		return this.plus(diff.scale(frac));
	}

	scale(sx, sy = sx) {
		return new XY(this.x*sx, this.y*sy);
	}

	plus(xy) {
		return new XY(this.x+xy.x, this.y+xy.y);
	}

	minus(xy) {
		return this.plus(xy.scale(-1));
	}

	round() {
		return new XY(Math.round(this.x), Math.round(this.y));
	}

	floor() {
		return new XY(Math.floor(this.x), Math.floor(this.y));
	}

	ceil() {
		return new XY(Math.ceil(this.x), Math.ceil(this.y));
	}
}

const RATIO = 1.6;






const BLOCKS_NONE = 0;
const BLOCKS_MOVEMENT = 1;
const BLOCKS_LIGHT = 2;

class Entity {
	constructor(visual) {
		this._visual = visual;
		this._blocks = BLOCKS_NONE; 
	}

	getVisual() { return this._visual; }
	blocks() { return this._blocks; }
}

class Floor extends Entity {
	constructor() {
		super({ch:".", fg:"#888"});
	}
}

class Wall extends Entity {
	constructor() {
		super({ch:"#", fg:"#888"});
		this._blocks = BLOCKS_LIGHT;
	}
}

class Grass extends Entity {
	constructor(ch) {
		super({ch, fg:"green"});
	}
}

class Door extends Entity {
	constructor() {
		super({ch:"/", fg:"saddlebrown"});
	}
}

const storage = Object.create(null);

function publish(message, publisher, data) {
	let subscribers = storage[message] || [];
	subscribers.forEach(subscriber => {
		typeof(subscriber) == "function"
			? subscriber(message, publisher, data)
			: subscriber.handleMessage(message, publisher, data);
	});
}

function subscribe(message, subscriber) {
	if (!(message in storage)) { storage[message] = []; }
	storage[message].push(subscriber);
}

const ROOM$$1 = new Floor();
const CORRIDOR$$1 = new Floor();
const DOOR$$1 = new Door();
const WALL = new Wall();
const GRASS_1 = new Grass(".");
const GRASS_2 = new Grass(",");
const GRASS_3 = new Grass(";");

const NOISE = new ROT.Noise.Simplex();

class Level {
	constructor(radius) {
		this.radius = radius;
		this.rooms = [];
		this._beings = {};
		this._items = {};
		this._cells = {};
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
			let noise = NOISE.get(xy.x, xy.y);
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

	setCell(xy, cell) {
		this._cells[xy.toString()] = cell;
	}

	setBeing(xy, being) {
		this._beings[xy.toString()] = being;
		publish("visual-change", this, {xy});
	}

	setItem(xy, item) {
		this._items[xy.toString()] = item;
	}

	carveRoom(room) {
		this.rooms.push(room);
		let xy = new XY();

		for (xy.x=room.lt.x; xy.x<=room.rb.x; xy.x++) {
			for (xy.y=room.lt.y; xy.y<=room.rb.y; xy.y++) {
				this.setCell(xy, ROOM$$1);
			}
		}
	}

	carveCorridor(xy1, xy2) {
		let diff = xy2.minus(xy1);
		let steps = diff.norm8() + 1;

		for (let i=0; i<=steps; i++) {
			let xy = xy1.lerp(xy2, i/steps).floor();
			this.setCell(xy, CORRIDOR$$1);
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
				if (this._cells[key] == CORRIDOR$$1) { this.setCell(xy, DOOR$$1); }
			}
		}
	}
}

// FIXME POLYFILL array.prototype.includes

const DIST = 10;

function roomSize() {
	let w = 2*randomInt(2, 5);
	let h = w + 2*randomInt(-1, 1);
	return new XY(w, h);
}

function cloneRoom(room) {
	return {
		neighbors: room.neighbors.slice(),
		lt: room.lt.clone(),
		rb: room.rb.clone(),
		center: room.center.clone(),
	}
}

function roomNearTo(xy) {
	let cx = xy.x + randomInt(-DIST, DIST);
	let cy = xy.y + randomInt(-DIST, DIST);
	let center = new XY(cx, cy);

	let size = roomSize();

	return {
		neighbors: [],
		center,
		lt: center.minus(size.scale(0.5)),
		rb: center.plus(size.scale(0.5))
	}
}

function enlarge(room, diff) {
	let clone = cloneRoom(room);
	clone.lt.x -= diff;
	clone.lt.y -= diff;
	clone.rb.x += diff;
	clone.rb.y += diff;
	return clone;
}

function furthestRoom(rooms, start) {
	let bestDist = 0;
	let bestRoom = null;

	let visited = [];

	function visit(room, dist) {
		visited.push(room);

		if (dist > bestDist) {
			bestDist = dist;
			bestRoom = room;
		}

		room.neighbors
			.filter(r => !visited.includes(r))
			.forEach(r => visit(r, dist+1));
	}

	visit(start, null, 0);
	return bestRoom;
}

(function() {
	let seed = Date.now();
	seed = 1486744938039;

	console.log("seed", seed);
	let state = seed;
	function random() {
		state = ((state * 1103515245) + 12345) & 0x7fffffff;
		return state / 0x7fffffff;
	}

	function randomInt(min, max) {
		return min + Math.floor((max-min+1)*random());
	}

	window.random = random;
	window.randomInt = randomInt;
})();

function connectHorizontal(level, room1, room2) {
	let min = Math.max(room1.lt.x, room2.lt.x);
	let max = Math.min(room1.rb.x, room2.rb.x);
	let x = randomInt(min, max);
	level.carveCorridor(new XY(x, room1.center.y), new XY(x, room2.center.y));
}

function connectVertical(level, room1, room2) {
	let min = Math.max(room1.lt.y, room2.lt.y);
	let max = Math.min(room1.rb.y, room2.rb.y);
	let y = randomInt(min, max);
	level.carveCorridor(new XY(room1.center.x, y), new XY(room2.center.x, y));
}

function connectL(level, room1, room2) {
	let p1 = new XY(room1.center.x, room2.center.y);
	let p2 = new XY(room2.center.x, room1.center.y);

	/* pick the one closer to the center */
	let P = (p1.norm() < p2.norm() ? p1 : p2);

	level.carveCorridor(room1.center, P);
	level.carveCorridor(room2.center, P);
}

function connect(level, room1, room2) {
	room1.neighbors.push(room2);
	room2.neighbors.push(room1);

	let overlapHorizontal = !(room1.lt.x > room2.rb.x || room2.lt.x > room1.rb.x);
	let overlapVertical = !(room1.lt.y > room2.rb.y || room2.lt.y > room1.rb.y);

	if (overlapHorizontal) {
		connectHorizontal(level, room1, room2);
	} else if (overlapVertical) {
		connectVertical(level, room1, room2);
	} else {
		connectL(level, room1, room2);
	}
}

function generateNextRoom(level) {
	let center = new XY(0, 0);
	let failed = -1;

	while (failed < 1000) {
		failed++;
		let oldRoom;
		if (level.rooms.length > 0) {
			oldRoom = level.rooms[Math.floor(level.rooms.length * random())];
			center = oldRoom.center;
		}

		let newRoom = roomNearTo(center); // fixme adaptive distance (seed:1486744938039, enlarge:3) 
		if (!level.isInside(newRoom.center)) { continue; }
		if (!level.fits(enlarge(newRoom, 2))) { continue; }
		level.carveRoom(newRoom);

		if (oldRoom) { connect(level, oldRoom, newRoom); }

		console.log("room #%s after %s failures", level.rooms.length, failed);
		return true;
	}

	console.log("failed to add after %s failures", failed);
	return false;
}

function connectWithClosest(room, level) {
	let COMPARE = (r1, r2) => r1.center.minus(room.center).norm() - r2.center.minus(room.center).norm();

	let avail = level.rooms.filter(r => !r.neighbors.includes(room) && r != room);
	avail.sort(COMPARE);
	if (!avail) { return; }

	connect(level, room, avail[0]);
}

function generate(radius) {
	let level = new Level(radius);
	
	while (true) {
		let ok = generateNextRoom(level);
		if (!ok) { break; }
	}

	let r1 = furthestRoom(level.rooms, level.rooms[0]);
	let r2 = furthestRoom(level.rooms, r1);

	connectWithClosest(r1, level);
	connectWithClosest(r2, level);

	level.rooms.forEach(room => level.carveDoors(room));
	level.trim();

	return level;
}

let level$1 = null;
let options = {
	width: 1,
	height: 1,
	fontSize: 18,
	fontFamily: "monospace, metrickal"
};
let display = new ROT.Display(options);
let center = new XY(0, 0); // level coords in the middle of the map
// level XY to display XY; center = middle point
function levelToDisplay(xy) {
	let half = new XY(options.width, options.height).scale(0.5).floor();

	return xy.minus(center).plus(half);
}

// display XY to level XY; middle point = center
function displayToLevel(xy) {
	let half = new XY(options.width, options.height).scale(0.5).floor();

	return xy.minus(half).plus(center);
}

function fit() {
	let node = display.getContainer();
	let parent = node.parentNode;
	let avail = new XY(parent.offsetWidth, parent.offsetHeight);

	let size = display.computeSize(avail.x, avail.y);
	size[0] += (size[0] % 2 ? 2 : 1);
	size[1] += (size[1] % 2 ? 2 : 1);
	options.width = size[0];
	options.height = size[1];
	display.setOptions(options);

	let current = new XY(node.offsetWidth, node.offsetHeight);
	let offset = avail.minus(current).scale(0.5);
	node.style.left = `${offset.x}px`;
	node.style.top = `${offset.y}px`;
}

function update(levelXY) {
	let visual = level$1.visualAt(levelXY);
//	if (!visual) { return; } // fixme really?
	let displayXY = levelToDisplay(levelXY);
	display.draw(displayXY.x, displayXY.y, visual.ch, visual.fg);
}

function setCenter(newCenter) {
	center = newCenter.clone();
	display.clear();

	let displayXY = new XY();
	for (displayXY.x=0; displayXY.x<options.width; displayXY.x++) {
		for (displayXY.y=0; displayXY.y<options.height; displayXY.y++) {
			update(displayToLevel(displayXY));
		}
	}
}

function setLevel(l) {
//	if (level) { memories[level.id] = memory; }
	level$1 = l;
//	memory = memories[level.id] || {};
	setCenter(center);

//	setTimeout(zoom, 2000);
}

function onVisualChange(message, publisher, data) {
	if (publisher != level$1) { return; }
	update(data.xy);
}

function init(parent) {
	parent.appendChild(display.getContainer());
	fit();
	subscribe("visual-change", onVisualChange);
}

let queue = [];

function add(actor) {
	queue.push(actor);
}





function loop() {
	let actor = queue.shift();
	queue.push(actor);
	actor.act().then(loop);
}

class Being extends Entity {
	constructor(visual) {
		super(visual);
		this._blocks = BLOCKS_MOVEMENT;
		this._xy = null;
		this._level = null;
	}

	act() {
		return Promise.resolve();
	}

	moveBy(dxy) {
		return this.moveTo(this._xy.plus(dxy));
	}

	moveTo(xy, level) {
		this._xy && this._level.setBeing(this._xy, null); // remove from old position

		this._level = level || this._level;
		this._xy = xy;

		this._level.setBeing(this._xy, this); // draw at new position
		
		return this;
	}
}

const CONSUMERS = [];

const DIRS = [
	new XY(-1, -1),
	new XY( 0, -1),
	new XY( 1, -1),
	new XY( 1,  0),
	new XY( 1,  1),
	new XY( 0,  1),
	new XY(-1,  1),
	new XY(-1,  0)
];
const DIR_CHARS = [null, "k", null, "l", null, "j", null, "h"];

function getDirection(e) {
	if (e.type == "keypress") {
		let ch = String.fromCharCode(e.charCode);
		let index = DIR_CHARS.indexOf(ch);
		if (index in DIRS) { return DIRS[index]; }
	}

	return null;
}





function push(consumer) {
	CONSUMERS.push(consumer);
}

function pop() {
	CONSUMERS.pop();
}

function handler(e) {
	let consumer = CONSUMERS[CONSUMERS.length-1];
	if (!consumer) { return; }
	consumer.handleKeyEvent(e);
}

document.addEventListener("keydown", handler);
document.addEventListener("keypress", handler);

class PC extends Being {
	constructor() {
		super({ch:"@", fg:"#fff"});
		this._resolve = null; // end turn
	}

	act() {
		console.log("player act");
		let promise = new Promise(resolve => this._resolve = resolve);

		promise = promise.then(() => pop());
		push(this);

		return promise;
	}

	handleKeyEvent(e) {
		let dir = getDirection(e);
		if (dir) {
			this.moveBy(dir);
			this._resolve();
		}
	}

	moveTo(xy, level) {
		super.moveTo(xy, level);
		setCenter(xy);
	}
}

var pc = new PC();

console.time("generate");
let level = generate(30);
console.timeEnd("generate");



init(document.querySelector("#map"));
setLevel(level);

pc.moveTo(new XY(-20, 0), level);

add(pc);
loop();

}());
