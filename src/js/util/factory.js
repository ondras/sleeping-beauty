import * as items from "item/items.js";

function get(classes, danger) {
	let d = ROT.RNG.getNormal(danger, 1);
	d = Math.max(1, d);

	if (d <= danger+1) { // okay, take this one
	} else { // too large -- take any other lower value
		d = ROT.RNG.getUniformInt(1, danger);
	}

	classes = Object.keys(classes).map(key => classes[key]);
	let avail = classes.filter(c => "danger" in c);

	let best = [];
	let bestDist = Infinity;
	avail.forEach(c => {
		let dist = Math.abs(c.danger - d);
		if (dist < bestDist) {
			bestDist = dist;
			best = [];
		}
		if (dist == bestDist) {
			best.push(c);
		}
	});
	let ctor = best.random();
	return new ctor();
}

export function getItem(danger) {
	return get(items, danger);
}
