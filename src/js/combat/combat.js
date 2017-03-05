import Board from "./board.js";
import XY from "util/xy.js";

import * as ui from "ui/combat.js";
import * as keyboard from "util/keyboard.js";

import pc from "being/pc.js";
import { ATTACK_1, ATTACK_2, MAGIC_1, MAGIC_2 } from "conf.js";

let board = new Board().randomize();
let resolve = null;
let enemy = null;
let cursor = new XY(0, 0);

function doDamage(attacker, defender, options = {}) {
	console.log("%s attacks %s (%o)", attacker, defender, options);
	defender.damage(5);
	if (!defender.isAlive()) {
		keyboard.pop();
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
	if (keyboard.isEnter(e)) { return activate(cursor); }

	let dir = keyboard.getDirection(e);
	if (!dir) { return; }

	dir = dir.scale(1, -1);
	cursor = cursor.plus(dir).mod(board.getSize());
	drawFull();
}

function drawFast() {
	ui.draw(board, cursor);
}

function drawFull() {
	let highlight = board.findSegment(cursor);
	if (highlight && highlight.length < 2) { highlight = null; }
	ui.draw(board, cursor, highlight || []);
}

export function init(parent) {
	ui.init(parent);
	checkSegments();
	drawFull();
}

export function start(e) {
	enemy = e;
	let promise = new Promise(r => resolve = r);
	// fixme visuals
	keyboard.push({handleKeyEvent});

	return promise;
}
