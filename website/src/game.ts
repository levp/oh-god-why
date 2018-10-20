import {compileHtml} from './view.js';

function main() {
	const game = new Game();

	compileHtml(document.body, {game});
}

class Game {
	public gold: number = 0;

	constructor() {
		setInterval(() => {
			this.gold++;
		}, 1000 / 30);
	}
}

main();
