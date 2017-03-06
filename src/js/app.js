import * as map from "ui/map/map.js";
import * as combat from "combat/combat.js";
import * as actors from "util/actors.js";
import * as intro from "ui/intro/intro.js";

import pc from "being/pc.js";
import { generate } from "level/generator.js";

let seed = Date.now();
console.log("seed", seed);
ROT.RNG.setSeed(seed);

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

intro.start(document.querySelector("#intro")).then(() => {
	map.init(document.querySelector("#map"));
	combat.init(document.querySelector("#combat"));
	map.activate();
	switchToLevel(level, level.start);
	actors.loop();
});
