import { generate } from "level/generator.js";
import * as map from "ui/map.js";

console.time("generate");
let level = generate(30);
console.timeEnd("generate");

map.init(document.querySelector("#map"));
map.setLevel(level);
