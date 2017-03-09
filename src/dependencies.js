"use strict";

let rollup = require("rollup");
let includePaths = require("rollup-plugin-includepaths");

let options = require("../rollup.config.js");
let prefix = require("path").resolve(__dirname, "js") + "/";

let modules = [];

function toDot(modules) {
    console.log("digraph G {");
    modules.forEach(m => {
        m.deps.forEach(dep => {
            console.log(`"${dep}" -> "${m.id}" [dir=back]`);
        });
    });
    console.log("}");
}

function prune(modules) {
    let avail = modules.filter(m => m.deps.length == 0);
    if (!avail.length) { return; }

    let id = avail[0].id;
//    console.log("pruning", id);
    let index = modules.indexOf(avail[0]);
    modules.splice(index, 1);
    modules.forEach(m => {
        m.deps = m.deps.filter(dep => dep != id);
    });
    prune(modules);
}

rollup.rollup(options).then(bundle => {
    let modules = [];
    bundle.modules.forEach(module => {
        let m = {
            id: module.id.substring(prefix.length),
            deps: module.dependencies.map(dep => dep.substring(prefix.length))
        }
        modules.push(m);
    });
    prune(modules);
    toDot(modules);
});

