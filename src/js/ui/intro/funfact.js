const FACTS = [
	"This game was created in one week",
	"This game was written using rot.js, the JavaScript Roguelike Toolkit",
	"The tower is procedurally generated. Try resizing this page!",
	"You can reload this page to get another Fun Fact",
	"The original Sleeping Beauty fairy tale was written by Charles Perrault",
	"This game is best played with a maximized browser window"
];

let node = document.createElement("div");
node.classList.add("funfact");
node.innerHTML = `Fun Fact: ${FACTS.random()}`;

export function getNode() {
	return node;
}