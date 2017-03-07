"use strict";

let rollup = require("rollup");
let includePaths = require("rollup-plugin-includepaths");

let options = require("../rollup.config.js");
let prefix = require("path").resolve(__dirname, "js") + "/";

rollup.rollup(options).then( bundle => {
    console.log("digraph G {");
    bundle.modules.forEach( module => {
        let id = module.id;
        let deps = module.dependencies;

        id = id.substring(prefix.length);
        deps.forEach(dep => {
            dep = dep.substring(prefix.length);
            console.log(`"${dep}" -> "${id}" [dir=back]`);
        });
    });
    console.log("}");
});
