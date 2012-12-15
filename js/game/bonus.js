/**
 * Adds a bonus item : the bomb
 */
Game.winBomb = function() {
	// We randomly position a bomb
	var bomb = new Game.Bomb(),
		x = 0,
		y = 0;
	Game.bonus.bomb = bomb;
	do {
		x = parseInt(Math.random() * Game.GRID_SIZE);
		y = parseInt(Math.random() * Game.GRID_SIZE);
	}while (get('#tile' + y + '_' + x) == null || get('#tile' + y + '_' + x).timer != undefined);
	bomb.style.left = ((60 * x) + (5 * (x + 1))) + 'px';
	bomb.style.top = ((60 * y) + (5 * (y + 1))) + 'px';
	bomb.id = 'tile' + y + '_' + x;
	get('#grid').removeChild(get('#tile' + y + '_' + x));
	get('#grid').appendChild(bomb);
};