var Game = {};	// The game instance

Game.GRID_SIZE = 8;
Game.GEM_HEIGHT = 65;

var map = [	// The level's map (coordinates are: map[y][x])
	[0, 1, 2, 1, 3, 4, 0, 1],
	[2, 1, 2, 2, 0, 2, 4, 4],
	[4, 4, 0, 3, 2, 0, 4, 1],
	[3, 3, 1, 0, 2, 0, 3, 0],
	[3, 4, 3, 0, 3, 1, 4, 2],
	[1, 2, 1, 4, 3, 0, 1, 2],
	[3, 1, 1, 2, 2, 4, 4, 1],
	[0, 1, 0, 0, 3, 4, 4, 1]
];

/**
 * Initializes the game
 */
Game.init = function () {
	Game.GEM_RANGE = 7;
	Game.level = 1;
	Game.gem = null;
	Game.score = {
		goal: 15000,
		total: 0,
		current: 0
	};
	Game.bonus = {};

	get('#level').innerHTML = Game.level;
	get('#total_score').innerHTML = Game.score.total;
	get('#restart_bt').onclick = Game.confirmRestart;
	Game.createGrid();
};

/**
 * Created the game's grid
 */
Game.createGrid = function() {
	var grid = get('#grid'), map = [], row, vGems = [], hGems = [];

	for (var i = 0, j = 0; i < Game.GRID_SIZE; i++) {
		row = [];
		map.push(row);	// We create a row in the map

		for (j = 0; j < Game.GRID_SIZE; j++) {
			do {
				gem = new Gem(j, i, parseInt(Math.random() * Game.GEM_RANGE));
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
};