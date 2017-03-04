import XY from "util/xy.js";

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
const DIR_CODES = [
];
const DIR_CHARS = [null, "k", null, "l", null, "j", null, "h"];

export function getDirection(e) {
	if (e.type == "keypress") {
		let ch = String.fromCharCode(e.charCode);
		let index = DIR_CHARS.indexOf(ch);
		if (index in DIRS) { return DIRS[index]; }
	}

	return null;
}

export function isEnter(e) {
	if (e.type != "keydown") { return null; }
	return (e.keyCode == 13);
}

export function getNumber(e) {
	if (e.type != "keypress") { return null; }
	let num = e.charCode - "0".charCodeAt(0);
	if (num < 0 || num > 9) { return null; }
	return num;
}

export function push(consumer) {
	CONSUMERS.push(consumer);
}

export function pop() {
	CONSUMERS.pop();
}

function handler(e) {
	let consumer = CONSUMERS[CONSUMERS.length-1];
	if (!consumer) { return; }
	consumer.handleKeyEvent(e);
}

document.addEventListener("keydown", handler);
document.addEventListener("keypress", handler);