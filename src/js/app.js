import { generate } from "level/generator.js";
import * as map from "ui/map.js";
import * as actors from "util/actors.js";
import XY from "util/xy.js";
import pc from "being/pc.js";

console.time("generate");
let level = generate(30);
console.timeEnd("generate");



map.init(document.querySelector("#map"));
map.setLevel(level);

pc.moveTo(new XY(-20, 0), level);

actors.add(pc);
actors.loop();
