import pc from "being/pc.js";

let node;

export function init(n) {
	node = n;
	node.classList.remove("hidden");
}

export function update() {
	node.innerHTML = "You have:";

	let ul = document.createElement("ul");
	node.appendChild(ul);

	ul.appendChild(buildStatus());
	ul.appendChild(buildItems());
}

function buildStatus() {
	// fixme colors?
	let node = document.createElement("li");
	let str = "100% health, 100% mana";

	let gold = pc.inventory.getItemByType("gold");
	let coins = (gold ? gold.amount : 0);
	if (coins > 0) { 
		let color = gold.getVisual().fg;
		let suffix = (coins > 1 ? "s" : "");
		str = `${str}, <span style="color:${color}">${coins}</span> ${gold.toString()}${suffix}`;
	}

	node.innerHTML = str;
	return node;
}

function buildItems() {
	let frag = document.createDocumentFragment();
	let items = pc.inventory.getItems().filter(i => i.getType() != "gold");
	items.forEach(item => {
		let node = document.createElement("li");
		node.innerHTML = item.toString();
		frag.appendChild(node);
	});
	return frag;
}
