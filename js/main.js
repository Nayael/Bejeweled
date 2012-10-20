// This variable represents the instance of the game
var game = {
	lvl: 0,				// The current level index
	level: levels[0],		// The current level object

	item: {
		sprite: null,
		offsetX: null,
		offsetY: null
	},

	/**
	 * Create an item from its coordinates and tile value
	 */
	createItem: function(i, j, tile) {
		var item, left, top;
		left = ((60 * j) + 5 * (j + 1)) + 'px';
		top = ((60 * i) + 5 * (i + 1)) +'px';

		item = document.createElement('span');
		item.className = 'item tile_' + tile;
		item.id = 'tile' + j + '_' + i;
		item.style.top = top;
		item.style.left = left;
		item.style.backgroundImage = 'url("../images/sprites/' + tile + '.png")';
		item.style.backgroundRepeat = 'no-repeat';
		item.style.backgroundPosition = 'top center';

		addEvent(item, 'mousedown', game.startDrag);
		return item;
	},

	/**
	 * Creates the grid for the level
	 */
	init: function() {
		var map = game.level.map, grid = get('#grid'), row, tile;

		for (var i = 0; i < map.length; i++) {
			row = map[i];
			for (var j = 0; j < row.length; j++) {
				tile = row[j];
				grid.appendChild(game.createItem(i, j, tile));	// Adding the new tile on the grid
			}
		}
	},

	/**
	 * Initializes the dragging of the clicked item
	 */
	startDrag: function(e) {
		var target = e.target || e.srcElement,
			x = parseInt(target.id.substr(4, 1)),
			y = parseInt(target.id.substr(6, 1)),
			targetValue = game.level.map[x][y];

		addEvent(target, 'mouseup', game.stopDrag);	// We allow the moving to the adjacent items

		// We run through the item's row (the 2 adjacent items)
		for (var i = ((x > 0) ? x - 1 : 0); i <= ((x < 7) ? x + 1 : 7); i++) {
			var itemValue = game.level.map[i][y],	// The value (sprite) of the item
				item = get('#tile' + i + '_' + y);	// The item <span>

			if (item != target) {	// On the adjacent items, if the player moves his mouse over them, the selected item moves
				addEvent(item, 'mouseup', game.stopDrag);	// We allow the moving to the adjacent items
				addEvent(item, 'mouseover', game.switchItems);
			}
		}

		// We run through the item's column (the 2 adjacent items)
		for (var j = ((y > 0) ? y - 1 : 0); j <= ((y < 7) ? y + 1 : 7); j++) {
			var itemValue = game.level.map[x][j],	// The value (sprite) of the item
				item = get('#tile' + x + '_' + j);	// The item <span>

			if (item != target) {	// On the adjacent items, if the player moves his mouse over them, the selected item moves
				addEvent(item, 'mouseup', game.stopDrag);	// We allow the moving to the adjacent items
				addEvent(item, 'mouseover', game.switchItems);
			}
		}

		game.item.sprite = target;
		game.item.x = target.style.left;
		game.item.y = target.style.top;
	},

	/**
	 * Stops the dragging of the selected item
	 */
	stopDrag: function(e) {
		var target = e.target || e.srcElement;

		game.item = {
			sprite: null,
			offsetX: null,
			offsetY: null
		};
		removeEvent(document, 'mousemove', game.moveItem);

	},

	/**
	 * Moves the dragged item to the hovered item's position
	 */
	switchItems: function(e) {
		var hovered = e.target || e.srcElement;
		
		// We move the selected sprite to its new position
		game.item.sprite.style.left = hovered.style.left
		game.item.sprite.style.top = hovered.style.top;

		// We move the hovered sprite to its new position
		hovered.style.left = game.item.x;
		hovered.style.top = game.item.y;

		game.item.x = game.item.sprite.style.left;
		game.item.y = game.item.sprite.style.top;
	}
};
game.init();