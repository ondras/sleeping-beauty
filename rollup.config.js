import includePaths from "rollup-plugin-includepaths";

let includePathsOptions = {
	paths: ["src/js"]
};

export default {
    entry: "src/js/app.js",
    dest: "app.js",
    format: "iife",
    plugins: [ includePaths(includePathsOptions) ]
};
