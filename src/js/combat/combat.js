import Board from "./board.js";
import pc from "being/pc.js";

let board = Board.random();

function addScore(color, score) {
	if (!(color in SCORES)) SCORES[color] = 0;
	SCORES[color] += score;
	document.querySelector("pre").innerHTML = JSON.stringify(SCORES, null, 2);
}

function activate(xy) {
	let segment = board.findSegment(xy);

	if (!segment || segment.length < 2) return;

	let score = segment.length * (segment.length+1) / 2;
	addScore(board.at(xy).color, score);

	segment.forEach(xy => {
		board.set(xy, null);
	});

	let animation = board.fall();
	draw(board);
	animation.start(() => draw(board));
}

draw(board);

