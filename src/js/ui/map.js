import XY from "util/xy.js";
import {ROOM, CORRIDOR, DOOR, GRASS} from "conf.js";

let level = null;
let options = {
	width: 1,
	height: 1,
	fontSize: 18,
	fontFamily: "monospace, metrickal"
}
let display = new ROT.Display(options);
let center = new XY(-20, 0); // level coords in the middle of the map
let memory = {};
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

function darken(color) {
	if (!color) { return color; }
	return ROT.Color.toRGB(ROT.Color.fromString(color).map(x => x>>1));
}

function memoize(xy) {
	let key = xy.toString();
	let visual = level.cells[key].visual;
	memory[key] = {
		ch: visual.ch,
		fg: darken(visual.fg),
		bg: darken(visual.bg)
	}
	update(xy);
}

function update(levelXY) {
	let visual = level.visualAt(levelXY);
//	if (!visual) { return; } // fixme really?
	let displayXY = levelToDisplay(levelXY);
	display.draw(displayXY.x, displayXY.y, visual.ch, visual.fg);
}

export function setCenter(newCenter) {
	center = newCenter.clone();
	display.clear();

	let displayXY = new XY();
	for (displayXY.x=0; displayXY.x<options.width; displayXY.x++) {
		for (displayXY.y=0; displayXY.y<options.height; displayXY.y++) {
			update(displayToLevel(displayXY));
		}
	}
}

export function setLevel(l) {
//	if (level) { memories[level.id] = memory; }
	level = l;
//	memory = memories[level.id] || {};
	setCenter(center);

//	setTimeout(zoom, 2000);
}

function zoom() {
	let time = 1500;
	let node = display.getContainer();
	node.style.transition = `transform ${time}ms`;

	let size1 = options.fontSize;
	let size2 = 150;
	let scale = size2/size1;

	node.style.transform = `scale(${scale})`;
	setTimeout(() => {
		options.fontSize = size2;
		display.setOptions(options);
		fit();
		setCenter(center);
		node.style.transition = "";
		node.style.transform = "";
		window.d = display;
	}, time);
}

export function init(parent) {
	parent.appendChild(display.getContainer());
	fit();
}
