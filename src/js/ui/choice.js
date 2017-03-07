import * as log from "ui/log.js";
import * as keyboard from "util/keyboard";

let resolve = null;
let count = 0;

function end(value) {
	keyboard.pop();
	resolve(value);
}

function handleKeyEvent(e) {
	if (keyboard.isEscape(e)) { return end(null); }

	let number = keyboard.getNumber();
	if (!number) { return end(null); }

	if (number > 0 && number <= count) { end(number); }
}

export default function choice(options) {
	count = options.length;

	options.forEach((o, index) => {
		log.add(`  {#fff}${index+1}{} ${o}\n`);
	});
	log.add(`{#fff}0{} or {#fff}Escape{} to abort`);

	keyboard.push({handleKeyEvent});
	return new Promise(r => resolve = r);
}