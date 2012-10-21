// This variable represents the instance of the game
var game = {
	lvl: 0,				// The current level index
	level: levels[0],		// The current level object
	hovered: null,
	item: {
		sprite: null,	// The selected sprite
		x: null,		// The source sprite's x
		y: null			// The source sprite's y
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
		item.style.border = 'solid 3px #000';

		addEvent(item, 'mousedown', game.startDrag);
		return item;
	},

	/**
	 * Creates the grid for the level
	 */
	init: function() {
		var map = game.level.map, grid = get('#grid'), row, tile;

		for (var i = 0; i < 8; i++) {
			row = map[i];
			for (var j = 0; j < 8; j++) {
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
			targetValue = game.level.map[x][y],
			itemValue,
			item;

		addEvent(document, 'mouseup', game.stopDrag);	// We allow the moving to the adjacent items

		game.item.sprite = target;
		game.item.x = target.style.left;
		game.item.y = target.style.top;

		// We run through the item's row (the 2 adjacent items)
		for (var i = ((x > 0) ? x - 1 : 0); i <= ((x < 7) ? x + 1 : 7); i++) {
			itemValue = game.level.map[i][y],	// The value (sprite) of the item
			item = get('#tile' + i + '_' + y);	// The item <span>

			if (item != target) {	// On the adjacent items, if the player moves his mouse over them, the selected item moves
				addEvent(item, 'mouseover', game.moveItem);
			}
		}

		// We run through the item's column (the 2 adjacent items)
		for (var j = ((y > 0) ? y - 1 : 0); j <= ((y < 7) ? y + 1 : 7); j++) {
			itemValue = game.level.map[x][j],	// The value (sprite) of the item
			item = get('#tile' + x + '_' + j);	// The item <span>

			if (item != target) {	// On the adjacent items, if the player moves his mouse over them, the selected item moves
				addEvent(item, 'mouseover', game.moveItem);	// We allow the moving to the adjacent items
			}
		}
	},

	/**
	 * Stops the dragging of the selected item
	 */
	stopDrag: function(e) {
		var map = game.level.map, item;

		// We remove the mouse event listeners
		removeEvent(document, 'mouseup', game.stopDrag);
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				item = get('#tile' + i + '_' + j);	// The item <span>
				removeEvent(item, 'mouseover', game.moveItem);
			}
		}

		// If checkLine(), faire disparaitre les trucs, combos, etc.

		// Else
		// if (game.hovered != null) {
		// 	game.item.x = game.hovered.style.left;
		// 	game.item.y = game.hovered.style.top;
		// 	game.swapItems(game.hovered, game.item.sprite);	// We re-swap the items to their respective original positions
		// }

		// We reset the swapped items information
		game.hovered = null;
		game.item = {
			sprite: null,
			offsetX: null,
			offsetY: null
		};
	},

	/**
	 * Moves the dragged item to the hovered item's position
	 */
	moveItem: function(e) {
		game.hovered = e.target || e.srcElement;
		game.swapItems(game.item.sprite, game.hovered);
	},

	/**
	 * Swaps two items
	 */
	swapItems: function(source, dest) {
		var sourceX = parseInt(source.id.substr(4, 1)),
			sourceY = parseInt(source.id.substr(6, 1)),
			sourceValue = parseInt(source.className.substr(10, 1)),
			destX = parseInt(dest.id.substr(4, 1)),
			destY = parseInt(dest.id.substr(6, 1)),
			destValue = parseInt(dest.className.substr(10, 1)),
			items = get('.item'),
			map = game.level.map;

	// TODO animation
		// We move the source sprite to its new position
		source.style.left = dest.style.left;
		source.style.top = dest.style.top;
		source.id = 'tile' + destX + '_' + destY;

	// TODO animation
		// We move the dest sprite to its new position
		dest.style.left = game.item.x;
		dest.style.top = game.item.y;
		dest.id = 'tile' + sourceX + '_' + sourceY;

		game.item.x = source.style.left;
		game.item.y = source.style.top;

		// We replace their values in the map
		map[sourceY][sourceX] = destValue;
		map[destY][destX] = sourceValue;

		// Once moved, the item cannot be moved again
		for (var i = 0; i < items.length; i++) {
			removeEvent(items[i], 'mouseover', game.moveItem);
		};
	},

	checkLine: function() {
		
	}
};
game.init();