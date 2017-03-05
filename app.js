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

	mod(xy) {
		let x = this.x % xy.x;
		if (x < 0) { x += xy.x; }
		let y = this.y % xy.y;
		if (y < 0) { y += xy.y; }
		return new XY(x, y);
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
	toString() { return this._visual.ch; }
}

class Floor extends Entity {
	constructor() {
		super({ch:".", fg:"#aaa"});
	}
}

class Wall extends Entity {
	constructor() {
		super({ch:"#", fg:"#666"});
		this._blocks = BLOCKS_LIGHT;
	}
}

class Grass extends Entity {
	constructor(ch) {
		super({ch, fg:"#693"});
	}
}

class Tree extends Entity {
	constructor() {
		super({ch:"T", fg:"green"});
	}
}

class Door extends Entity {
	constructor() {
		super({ch:"/", fg:"#963"});
		ROT.RNG.getUniform() > 0.5 ? this.open() : this.close();
	}

	isOpen() { return this._open; }

	blocks() {
		return (this._open ? BLOCKS_NONE : BLOCKS_LIGHT);
	}

	close() {
		this._visual.ch = "+";
		this._open = false;
	}

	open() {
		this._visual.ch = "/";
		this._open = true;
	}
}

let queue = [];

function add(actor) {
	queue.push(actor);
}

function clear() {
	queue = [];
}

function remove(actor) {
	let index = queue.indexOf(actor);
	if (index > -1) { queue.splice(index, 1); }
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
		this._hp = 10;
	}

	getXY() { return this._xy; }
	getLevel() { return this._level; }
	isAlive() { return (this._hp > 0); }

	damage(amount) {
		if (this._hp == 0) { return; }
		this._hp = Math.max(0, this._hp-amount);
		if (this._hp == 0) { this.die(); }
	}
	
	die() {
		this._level.setBeing(this._xy, null);
		remove(this);
		// fixme drop stuff?
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

const RATIO = 1.6;

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

const ATTACK_1 = "a1";
const ATTACK_2 = "a2";
const MAGIC_1 = "m1";
const MAGIC_2 = "m2";

const CONSUMERS = [];

const DIR_CODES = [ROT.VK_HOME, ROT.VK_UP, ROT.VK_PAGE_UP, ROT.VK_RIGHT, ROT.VK_PAGE_DOWN, ROT.VK_DOWN, ROT.VK_END, ROT.VK_LEFT];
const DIR_CHARS = ["y", "k", "u", "l", "n", "j", "b", "h"];

function getDirection(e) {
	if (e.type == "keypress") {
		let ch = String.fromCharCode(e.charCode).toLowerCase();
		let index = DIR_CHARS.indexOf(ch);
		if (index in DIRS) { return DIRS[index]; }
	}
	if (e.type == "keydown") {
		let index = DIR_CODES.indexOf(e.keyCode);
		if (index in DIRS) { return DIRS[index]; }
	}
	return null;
}

function hasModifier(e) {
	return (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey);
}

function isEnter(e) {
	if (e.type != "keydown") { return null; }
	return (e.keyCode == 13);
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

const AI_RANGE = 7;
const AI_IDLE = .5;
const PC_SIGHT = 8;

let COMBAT_OPTIONS = {
	[ATTACK_1]: 10,
	[ATTACK_2]: 10,
	[MAGIC_1]: 10,
	[MAGIC_2]: 10
};

class PC extends Being {
	constructor() {
		super({ch:"@", fg:"#fff"});
		this._resolve = null; // end turn
		this._blocks = BLOCKS_NONE; // in order to see stuff via FOV...
		this._fov = {};
	}

	getFOV() { return this._fov; }

	getCombatOption() {
		return ROT.RNG.getWeightedValue(COMBAT_OPTIONS);
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
		let modifier = hasModifier(e);
		if (dir) {
			let xy = this._xy.plus(dir);
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
		fov.compute(this._xy.x, this._xy.y, PC_SIGHT, cb);
		this._fov = newFOV;

		publish("visibility-change", this, {xy:this._xy});
	}
}

var pc = new PC();

const GRASS_1 = new Grass("\"");
const GRASS_2 = new Grass("'");
const TREE = new Tree();

const NOISE = new ROT.Noise.Simplex();

function darken(color) {
	if (!color) { return color; }
	return ROT.Color.toRGB(ROT.Color.fromString(color).map(x => x>>1));
}

class Memory {
	constructor(level) {
		this._level = level;
		this._memoized = {};
	}

	visualAt(xy) {
		if (this._level.isOutside(xy)) {
			let entity;
			let noise = NOISE.get(xy.x/20, xy.y/20);
			if (noise < 0) {
				entity = GRASS_1;
			} else if (noise < 0.8) {
				entity = GRASS_2;
			} else {
				entity = TREE;
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
		};
	}
}

let level$1 = null;
let options = {
	width: 1,
	height: 1,
	fontSize: 18,
	fontFamily: "metrickal, monospace"
};
let display = new ROT.Display(options);
let center = new XY(0, 0); // level coords in the middle of the map
let memory = null;
let memories = {};

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
	let visual = memory.visualAt(levelXY);
	if (!visual) { return; }
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
	level$1 = l;

	if (!(level$1.id in memories)) {
		memories[level$1.id] = new Memory(level$1);
	}
	memory = memories[level$1.id];

	setCenter(center);
}

function handleMessage(message, publisher, data) {
	switch (message) {
		case "visibility-change":
			setCenter(data.xy);
		break;

		case "visual-change":
			if (publisher != level$1) { return; }
			update(data.xy);
		break;
	}
}

function init(parent) {
	parent.appendChild(display.getContainer());
	fit();
	subscribe("visual-change", handleMessage);
	subscribe("visibility-change", handleMessage);
}

const SPEED = 10; // cells per second

class Animation {
	constructor() {
		this._items = [];
		this._ts = null;
		this._resolve = null;
	}

	add(item) {
		this._items.push(item);
		item.cell.animated = item.from;
	}

	start(drawCallback) {
		let promise = new Promise(resolve => this._resolve = resolve);
		this._drawCallback = drawCallback;
		this._ts = Date.now();
		this._step();
		return promise;
	}

	_step() {
		let time = Date.now() - this._ts;

		let i = this._items.length;
		while (i --> 0) { /* down so we can splice */
			let item = this._items[i];
			let finished = this._stepItem(item, time);
			if (finished) { 
				this._items.splice(i, 1);
				item.cell.animated = null;
			}
		}

		this._drawCallback();
		if (this._items.length > 0) { 
			requestAnimationFrame(() => this._step());
		} else {
			this._resolve();
		}
	}

	_stepItem(item, time) {
		let dist = item.from.dist8(item.to);

		let frac = (time/1000) * SPEED / dist;
		let finished = false;
		if (frac >= 1) {
			finished = true;
			frac = 1;
		}

		item.cell.animated = item.from.lerp(item.to, frac);

		return finished;
	}
}

const W = 6;
const H = W;

class Board {
	constructor() {
		this._data = [];

		for (let i=0;i<W;i++) {
			let col = [];
			this._data.push(col);
			for (let j=0;j<H;j++) { col.push(null); }
		}
	}

	randomize() {
		this._data.forEach(col => {
			col.forEach((cell, i) => {
				col[i] = {value:pc.getCombatOption()};
			});
		});
		return this;
	}

	getSize() {
		return new XY(W, H);
	}

	at(xy) {
		return this._data[xy.x][xy.y];
	}

	set(xy, value) {
		this._data[xy.x][xy.y] = value;
	}

	_clone() {
		let clone = new this.constructor();
		clone._data = JSON.parse(JSON.stringify(this._data));
		return clone;
	}

	fall() {
		let animation = new Animation();

		this._data.forEach((col, index) => {
			this._fallColumn(index, animation);
		});

		return animation;
	}

	_fallColumn(x, animation) {
		let totalFall = 0;
		let col = this._data[x];

		col.forEach((cell, y) => {
			if (cell) {
				if (totalFall == 0) { return; }
				let targetY = y-totalFall;

				col[targetY] = cell;
				col[y] = null;

				animation.add({
					cell,
					from: new XY(x, y),
					to: new XY(x, targetY),
				});
			} else {
				totalFall++;
			}
		});

		/* new cells */
		for (let i=0;i<totalFall;i++) {
			let cell = {value:pc.getCombatOption()};
			let sourceY = col.length+i;
			let targetY = sourceY - totalFall;
			col[targetY] = cell;

			animation.add({
				cell,
				from: new XY(x, sourceY),
				to: new XY(x, targetY),
			});
		}
	}

	findSegment(xy) {
		function is(sxy) { return sxy.is(xy); }
		return this.getAllSegments().filter(segment => segment.some(is))[0];
	}

	getAllSegments() {
		let clone = this._clone();
		let segments = [];
		let xy = new XY();
		for (xy.x=0; xy.x<W; xy.x++) {
			for (xy.y=0; xy.y<H; xy.y++) {
				let cell = clone.at(xy);
				if (!cell) { continue; }
				let segment = clone.extractSegment(xy);
				segments.push(segment);
			}
		}

		return segments.sort((a, b) => b.length-a.length);
	}

	/* mutates! */
	extractSegment(xy) {
		let segment = [];
		let value = this.at(xy).value;

		let tryIt = (xy) => {
			if (xy.x<0 || xy.y<0 || xy.x>=W || xy.y>=H) { return; }
			let cell = this.at(xy);
			if (!cell || cell.value != value) { return; }

			this.set(xy, null);
			segment.push(xy.clone());
			tryIt(xy.plus(new XY( 1,  0)));
			tryIt(xy.plus(new XY(-1,  0)));
			tryIt(xy.plus(new XY( 0, -1)));
			tryIt(xy.plus(new XY( 0,  1)));
		};

		tryIt(xy);
		return segment;
	}
}

const CELL = 30;
const CTX = document.createElement("canvas").getContext("2d");

const COLORS = {
	[ATTACK_1]: "red",
	[ATTACK_2]: "lime",
	[MAGIC_1]: "blue",
	[MAGIC_2]: "yellow"
};

function drawCell(xy, color, highlight) {
	let x = (xy.x+0.5)*CELL;
	let y = CTX.canvas.height-(xy.y+0.5)*CELL;

	let alpha = 0.75;
	let bold = false;
	if (highlight.some(hxy => hxy.is(xy))) { 
		alpha = 1; 
		bold = true;
	}

	CTX.font = `${bold ? "bold " : ""}${CELL*0.8}px metrickal, monospace`;
	CTX.globalAlpha = alpha;

	CTX.fillStyle = color;
	CTX.fillText("#", x, y);
}

function drawCursor(xy) {
	CTX.strokeStyle = "#999";
	CTX.lineWidth = 2;

	let X = xy.x * CELL;
	let Y = CTX.canvas.height-(xy.y+1)*CELL;
	CTX.strokeRect(X+2, Y+2, CELL-4, CELL-4);
}

function draw(board, cursor, highlight = []) {
	let size = board.getSize();
	CTX.canvas.width = size.x*CELL;
	CTX.canvas.height = size.y*CELL;
	CTX.textAlign = "center";
	CTX.textBaseline = "middle";

	let xy = new XY();
	for (xy.x=0; xy.x<size.x; xy.x++) {
		for (xy.y=0; xy.y<size.y; xy.y++) {
			let cell = board.at(xy);
			if (!cell) { return; }
			let pos = cell.animated || xy;
			let color = COLORS[cell.value];
			drawCell(pos, color, highlight);
		}
	}

	drawCursor(cursor);
}

function init$2(parent) {
	parent.appendChild(CTX.canvas);
}

let board = new Board().randomize();
let resolve = null;
let enemy = null;
let cursor = new XY(0, 0);

function doDamage(attacker, defender, options = {}) {
	console.log("%s attacks %s (%o)", attacker, defender, options);
	defender.damage(5);
	if (!defender.isAlive()) {
		pop();
		resolve();
	}
}

function activate(xy) {
	let segment = board.findSegment(xy);
	if (!segment || segment.length < 2) { return; }

	let value = board.at(xy).value;

	segment.forEach(xy => {
		board.set(xy, null);
	});

	let animation = board.fall();
	animation.start(drawFast).then(() => {
		checkSegments();
		drawFull();
	});

	let power = segment.length * (segment.length+1) / 2;
	let isMagic = (value == MAGIC_1 || value == MAGIC_2);
	let attacker = pc;
	let defender = enemy;
	if (value == ATTACK_2 || value == MAGIC_2) {
		attacker = enemy;
		defender = pc;
	}

	doDamage(attacker, defender, {isMagic});
}

function checkSegments() {
	while (1) {
		let segments = board.getAllSegments();
		if (segments[0].length >= 2) { return; }
		board.randomize();
	} 
}

function handleKeyEvent(e) {
	if (isEnter(e)) { return activate(cursor); }

	let dir = getDirection(e);
	if (!dir) { return; }

	dir = dir.scale(1, -1);
	cursor = cursor.plus(dir).mod(board.getSize());
	drawFull();
}

function drawFast() {
	draw(board, cursor);
}

function drawFull() {
	let highlight = board.findSegment(cursor);
	if (highlight && highlight.length < 2) { highlight = null; }
	draw(board, cursor, highlight || []);
}

function init$1(parent) {
	init$2(parent);
	checkSegments();
	drawFull();
}

function start(e) {
	enemy = e;
	let promise = new Promise(r => resolve = r);
	// fixme visuals
	push({handleKeyEvent});

	return promise;
}

const ROOM = new Floor();
const CORRIDOR = new Floor();
const WALL = new Wall();

function dangerToRadius(danger) {
	return 30; // fixme
}

class Level {
	constructor(danger) {
		this.danger = this.id = danger;
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
		publish("visual-change", this, {xy});
	}

	getBeings() {
		return Object.keys(this._beings).map(key => this._beings[key]);
	}

	setItem(xy, item) {
		this._items[xy.toString()] = item;
		publish("visual-change", this, {xy});
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
				if (this._cells[key] == CORRIDOR) { this.setCell(xy, new Door()); }
			}
		}
	}
}

// FIXME POLYFILL array.prototype.includes

const DIST = 10;

function roomSize() {
	let w = 2*ROT.RNG.getUniformInt(2, 5);
	let h = w + 2*ROT.RNG.getUniformInt(-1, 1);
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
	let cx = xy.x + ROT.RNG.getUniformInt(-DIST, DIST);
	let cy = xy.y + ROT.RNG.getUniformInt(-DIST, DIST);
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

function wander(who) {
	let result = Promise.resolve();

	if (ROT.RNG.getUniform() > AI_IDLE) { return result; }

	let level = who.getLevel();

	let dirs = DIRS.filter(dxy => {
		let entity = level.getEntity(who.getXY().plus(dxy));
		return entity.blocks() < BLOCKS_MOVEMENT;
	});
	
	if (!dirs.length) { return result; }
	
	let dir = dirs.random();
	let xy = who.getXY().plus(dir);
	who.moveTo(xy);
	return result;
}

function getCloserToPC(who) {
	let best = 1/0;
	let avail = [];

	DIRS.forEach(dxy => {
		let xy = who.getXY().plus(dxy);
		let entity = who.getLevel().getEntity(xy);
		if (entity.blocks() >= BLOCKS_MOVEMENT) { return; }
		
		let dist = xy.dist8(pc.getXY());
		if (dist < best) {
			best = dist;
			avail = [];
		}
		
		if (dist == best) { avail.push(xy); }
	});
	
	if (avail.length) {
		who.moveTo(avail.random());
	}

	return Promise.resolve();
}

function attack(who) {
	let dist = who.getXY().dist8(pc.getXY());
	if (dist == 1) {
		// fixme log
		return start(who);
	} else if (dist <= AI_RANGE) {
		return getCloserToPC(who);
	} else {
		return wander(who);
	}
}

function actEnemy(who) {
	return attack(who);
}

class Enemy extends Being {
	constructor(visual) {
		super(visual);
	}

	act() {
		return actEnemy(this);
	}
}

class Rat extends Enemy {
	constructor() {
		super({ch:"r", fg:"gray"});
	}
}

function decorate(level) {
	let r1 = furthestRoom(level.rooms, level.rooms[0]);
	let r2 = furthestRoom(level.rooms, r1);

	level.start = r1.center;
	level.end = r2.center;

	level.rooms.forEach(room => level.carveDoors(room));	

	let rat = new Rat();
	rat.moveTo(level.start.plus(new XY(3, 0)), level);

}

function connectHorizontal(level, room1, room2) {
	let min = Math.max(room1.lt.x, room2.lt.x);
	let max = Math.min(room1.rb.x, room2.rb.x);
	let x = ROT.RNG.getUniformInt(min, max);
	level.carveCorridor(new XY(x, room1.center.y), new XY(x, room2.center.y));
}

function connectVertical(level, room1, room2) {
	let min = Math.max(room1.lt.y, room2.lt.y);
	let max = Math.min(room1.rb.y, room2.rb.y);
	let y = ROT.RNG.getUniformInt(min, max);
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
			oldRoom = level.rooms.random();
			center = oldRoom.center;
		}

		let newRoom = roomNearTo(center);
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

function generate(danger) {
	let level = new Level(danger);
	
	while (true) {
		let ok = generateNextRoom(level);
		if (!ok) { break; }
	}

	let r1 = furthestRoom(level.rooms, level.rooms[0]);
	let r2 = furthestRoom(level.rooms, r1);
	connectWithClosest(r1, level);
	connectWithClosest(r2, level);

	decorate(level);

	level.trim();

	return level;
}

let seed = Date.now();
console.log("seed", seed);
ROT.RNG.setSeed(seed);

init(document.querySelector("#map"));
init$1(document.querySelector("#combat"));

function switchToLevel(level, xy) {
	clear();

	setLevel(level);
	pc.moveTo(xy, level);

	let beings = level.getBeings();
	beings.forEach(being => add(being));
}

console.time("generate");
let level = generate(1);
console.timeEnd("generate");

push({
	handleKeyEvent() {
		pop();
		switchToLevel(level, level.start);
		loop();
	}
});

}());
