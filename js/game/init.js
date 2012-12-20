// Game initialisation

var Game = {};	// The game instance
Game.GRID_SIZE = 8;
Game.TILE_SIZE = 65;

/**
 * Initializes the game
 */
Game.init = function () {
	Game.gemRange = 7;		// The number of different gems on the grid
	Game.level = 1;
	Game.time = 0;
	Game.gem = null;		// The currently selected gem
	Game.moving = false;	// Are the gems moving or not ?
	Game.score = {
		goal: 15000,
		current: 14700,
		total: 14700
	};
	Game.bonus = {};
	Game.initTimer();

	// We initialize the UI
	get('#level').innerHTML = Game.level;
	get('#total_score').innerHTML = Game.score.total;
	get('#restart_bt').onclick = Game.confirmRestart;

	Game.createGrid();
};

/**
 * Created the game's grid
 */
Game.createGrid = function() {
	var grid = get('#grid'), map = [], row, vGems = [], hGems = [], bg;

	for (var i = 0, j = 0; i < Game.GRID_SIZE; i++) {
		row = [];
		map.push(row);	// We create a row in the map

		for (j = 0; j < Game.GRID_SIZE; j++) {
			do {
				gem = new Game.Gem(j, i, parseInt(Math.random() * Game.gemRange));
				if (i > 0)
					vGems = gem.parseNeighbours(true, -1);
				if (j > 0)
					hGems = gem.parseNeighbours(false, -1);
			}while (vGems.length >= 2 || hGems.length >= 2);

			gem.addEventListener('click', Game.onGemClick, false);	// We add the mouse event listener
			gem.pop(grid);
			vGems = [];
			hGems = [];
		};
	};

	// We choose a random background
	do {
		bg = Math.floor(1 + Math.random() * 3);
		get('#content').style.backgroundImage = 'url("./images/background_hover.png"), url("./images/background' + bg + '.jpg")';
	} while (bg === Game.background);
	Game.background = bg;

	// var map = [	// The level's map (coordinates are: map[y][x])
	// 	[0, 3, 0, 3, 0, 3, 0, 3],
	// 	[1, 2, 1, 2, 1, 2, 1, 2],
	// 	[0, 3, 0, 3, 0, 3, 0, 3],
	// 	[1, 2, 1, 2, 1, 2, 1, 2],
	// 	[0, 3, 0, 3, 0, 3, 0, 3],
	// 	[1, 2, 1, 2, 1, 2, 1, 2],
	// 	[0, 3, 0, 3, 0, 3, 0, 3],
	// 	[1, 2, 1, 2, 1, 2, 1, 2]
	// ];

	// var grid = get('#grid'), row, value;

	// for (var i = 0; i < map.length; i++) {
	// 	row = map[i];
	// 	for (var j = 0; j < row.length; j++) {
	// 		value = row[j];
	// 		gem = new Game.Gem(j, i, value);
	// 		gem.addEventListener('click', Game.onGemClick, false);	// We add the mouse event listener
	// 		gem.pop(grid);
	// 	};
	// };
	// We check if there is at least one possible move
	Game.checkGameOver();
};