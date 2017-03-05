import XY from "util/xy.js";
import { ATTACK_1, ATTACK_2, MAGIC_1, MAGIC_2 } from "conf.js";

const CELL = 30;
const CTX = document.createElement("canvas").getContext("2d");

const COLORS = {
	[ATTACK_1]: "red",
	[ATTACK_2]: "lime",
	[MAGIC_1]: "blue",
	[MAGIC_2]: "yellow"
}

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

export function draw(board, cursor, highlight = []) {
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

export function init(parent) {
	parent.appendChild(CTX.canvas);
}