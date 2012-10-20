// This variable represents the instance of the game
var game = {
	lvl : 0,				// The current level index
	level : levels[0],		// The current level object

	/**
	 * Create an item from its coordinates and tile value
	 */
	createItem: function(i, j, tile) {
		var item, left, top;
		left = ((60 * j) + 5 * (j + 1)) + 'px';
		top = ((60 * i) + 5 * (i + 1)) +'px';

		item = document.createElement('span');
		item.className = 'item';
		item.id = 'tile' + i + '_' + j;
		item.style.top = top;
		item.style.left = left;
		item.style.backgroundImage = 'url("../images/sprites/' + tile + '.png")';
		item.style.backgroundRepeat = 'no-repeat';
		item.style.backgroundPosition = 'top center';
		return item;
	},

	/**
	 * Creates the grid for the level
	 */
	createMap: function() {
		var map = game.level.map, grid = get('#grid'), row, tile;

		for (var i = 0; i < map.length; i++) {
			row = map[i];
			for (var j = 0; j < row.length; j++) {
				tile = row[j];
				grid.appendChild(game.createItem(i, j, tile));	// Adding the new tile on the grid
			}
		}
	}
};
game.createMap();