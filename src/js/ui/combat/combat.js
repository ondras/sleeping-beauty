const CELL = 30;
const CTX = document.createElement("canvas").getContext("2d");

function drawCell(xy, color) {
	CTX.fillStyle = color;
	CTX.fillRect(xy.x*CELL, (H-xy.y-1)*CELL, CELL, CELL);
}

function drawCursor(xy) {
	CTX.strokeStyle = "#444";
	CTX.lineWidth = 2;

	let X = xy.x * CELL;
	let Y = (H-xy.y-1) * CELL;
	CTX.strokeRect(X+2, Y+2, CELL-4, CELL-4);
}

function draw(board) {
	/* clear */
	CTX.canvas.width = W*CELL;
	CTX.canvas.height = H*CELL;

	let xy = new XY();
	for (xy.x=0; xy.x<W; xy.x++) {
		for (xy.y=0; xy.y<H; xy.y++) {
			let cell = board.at(xy);
			if (!cell) { return; }
			let pos = cell.animated || xy;
			drawCell(pos, cell.color);
		}
	}

	drawCursor(board.cursor);
}

export function init(parent) {
	parent.appendChild(CTX.canvas);
}
