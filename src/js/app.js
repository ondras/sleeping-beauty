import * as map from "ui/map.js";
import * as actors from "util/actors.js";
import pc from "being/pc.js";
import { generate } from "level/generator.js";

map.init(document.querySelector("#map"));

function switchToLevel(level, xy) {
	actors.clear();

	map.setLevel(level);
	pc.moveTo(xy, level);

	let beings = level.getBeings();
	beings.forEach(being => actors.add(being));
}

console.time("generate");
let level = generate(1);
console.timeEnd("generate");

switchToLevel(level, level.start);
actors.loop();
