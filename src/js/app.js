import { generate } from "level/generator.js";
import * as map from "ui/map.js";
import * as actors from "util/actors.js";
import XY from "util/xy.js";
import pc from "being/pc.js";

console.time("generate");
let level = generate(1);
console.timeEnd("generate");

map.init(document.querySelector("#map"));
map.setLevel(level);

pc.moveTo(level.start, level);

let beings = level.getBeings();
beings.forEach(being => actors.add(being));

actors.loop();
