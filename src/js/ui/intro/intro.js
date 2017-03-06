import * as keyboard from "util/keyboard.js";
import * as tower from "./tower.js";
import * as title from "./title.js";
import * as bottom from "./bottom.js";
import * as text from "./text.js";
import * as funfact from "./funfact.js";

let resolve = null;

function handleKeyEvent(e) {
	if (!keyboard.isEnter(e)) { return; }
	keyboard.pop();
	window.removeEventListener("resize", onResize);
	resolve();
}

function onResize(e) {
	tower.fit();
	bottom.fit();
}

export function start(node) {
	node.appendChild(title.getNode());
	node.appendChild(bottom.getNode());
	node.appendChild(text.getNode());
	node.appendChild(tower.getNode());
	node.appendChild(funfact.getNode());

	tower.fit();
	bottom.fit();

	keyboard.push({handleKeyEvent});
	window.addEventListener("resize", onResize);

	return new Promise(r => resolve = r);
}
