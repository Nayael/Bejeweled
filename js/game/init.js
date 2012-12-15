var Game = {};	// The game instance
Game.GRID_SIZE = 8;
Game.GEM_HEIGHT = 65;

/**
 * Initializes the game
 */
Game.init = function () {
	Game.gemRange = 7;		// The number of different gems on the grid
	Game.level = 1;
	Game.time = 0;
	Game.gem = null;		// The currently selected gem
	Game.hint = null;		// A hint for the player : an array containing gems that can be moved to make a streak
	Game.moving = false;	// Are the gems moving or not ?
	Game.score = {
		goal: 15000,
		total: 0,
		current: 0
	};
	Game.bonus = {};

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
	var grid = get('#grid'), map = [], row, vGems = [], hGems = [];

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
	
	// We check if there is at least one possible move
	Game.checkGameOver();
};