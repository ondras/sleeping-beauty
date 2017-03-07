export const BLOCKS_NONE = 0;
export const BLOCKS_MOVEMENT = 1;
export const BLOCKS_LIGHT = 2;

export default class Entity {
	constructor(visual) {
		this._visual = visual;
		this._blocks = BLOCKS_NONE; 
	}

	getVisual() { return this._visual; }
	blocks() { return this._blocks; }

	toString() { return this._visual.name; }
	describeThe() { return `the ${this}`; }
	describeA() {
		let first = this._visual.name.charAt(0);
		let article = (first.match(/[aeiou]/i) ? "an" : "a");
		return `${article} ${this}`;
	}
}

String.format.map.the = "describeThe";
String.format.map.a = "describeA";

// being-specific
String.format.map.he = "describeHe";
String.format.map.his = "describeHis";
String.format.map.him = "describeHim";
