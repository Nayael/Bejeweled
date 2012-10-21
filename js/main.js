// This variable represents the instance of the game
var game = {
	lvl: 0,				// The current level index
	level: levels[0],	// The current level object

	hovered: null,		// The hovered item to swap with

	item: {
		sprite: null,	// The selected sprite
		x: null,		// The source sprite's x
		y: null			// The source sprite's y
	},

	itemsToRemove: [],

	/**
	 * Creates an item from its coordinates and tile value
	 */
	createItem: function(i, j, tile) {
		var item, left, top;
		left = ((60 * j) + 5 * (j + 1)) + 'px';
		top = ((60 * i) + 5 * (i + 1)) +'px';

		item = document.createElement('span');
		item.className = 'item tile_' + tile;
		item.id = 'tile' + i + '_' + j;
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
			x = parseInt(target.id.substr(6, 1)),
			y = parseInt(target.id.substr(4, 1)),
			targetValue = game.level.map[y][x],
			itemValue,
			item;

		addEvent(document, 'mouseup', game.stopDrag);	// We allow the moving to the adjacent items

		game.item.sprite = target;
		game.item.x = target.style.left;
		game.item.y = target.style.top;

		// We run through the item's row (the 2 adjacent items)
		for (var i = ((x > 0) ? x - 1 : 0); i <= ((x < 7) ? x + 1 : 7); i++) {
			itemValue = game.level.map[y][i],	// The value (sprite) of the item
			item = get('#tile' + y + '_' + i);	// The item <span>

			if (item != target) {	// On the adjacent items, if the player moves his mouse over them, the selected item moves
				addEvent(item, 'mouseover', game.moveItem);
			}
		}

		// We run through the item's column (the 2 adjacent items)
		for (var j = ((y > 0) ? y - 1 : 0); j <= ((y < 7) ? y + 1 : 7); j++) {
			itemValue = game.level.map[j][x],	// The value (sprite) of the item
			item = get('#tile' + j + '_' + x);	// The item <span>

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

		if (game.checkStreak()){
			game.removeStreak();
		}else{
			if (game.hovered != null) {
				game.item.x = game.hovered.style.left;
				game.item.y = game.hovered.style.top;
				game.swapItems(game.hovered, game.item.sprite);	// We re-swap the items to their respective original positions
			}
		}

		// We reset the swapped items information
		game.hovered = null;
		game.item = {
			sprite: null,
			offsetX: null,
			offsetY: null
		};
		game.itemsToRemove = [];
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
		var sourceX = parseInt(source.id.substr(6, 1)),
			sourceY = parseInt(source.id.substr(4, 1)),
			sourceValue = parseInt(source.className.substr(10, 1)),
			destX = parseInt(dest.id.substr(6, 1)),
			destY = parseInt(dest.id.substr(4, 1)),
			destValue = parseInt(dest.className.substr(10, 1)),
			items = get('.item'),
			map = game.level.map;

	// TODO animation
		// We move the source sprite to its new position
		source.style.left = dest.style.left;
		source.style.top = dest.style.top;
		source.id = 'tile' + destY + '_' + destX;

	// TODO animation
		// We move the dest sprite to its new position
		dest.style.left = game.item.x;
		dest.style.top = game.item.y;
		dest.id = 'tile' + sourceY + '_' + sourceX;

		game.item.x = source.style.left;
		game.item.y = source.style.top;

		// We replace their values in the map
		map[sourceY][sourceX] = destValue;
		map[destY][destX] = sourceValue;

		// Once moved, the item cannot be moved again
		for (var i = 0; i < items.length; i++) {
			removeEvent(items[i], 'mouseover', game.moveItem);
		}
	},

	/**
	 * Searches for the presence of an item streak
	 */
	checkStreak: function() {
		var x = parseInt(game.item.sprite.id.substr(6, 1)),
			y = parseInt(game.item.sprite.id.substr(4, 1)),
			map = game.level.map,
			value = map[y][x],
			row = [],
			column = [];

		// Checking in the row
		if (x > 0) {
			for (var i = x - 1; i > -1; i--) {	// Checking the items on the left
				if (map[y][i] == value)						// If the read item's value is the same as the adjacent item's value
				    row.push(get('#tile' + y + '_' + i));	// We add it to the items to remove
				else	// Otherwise
					break;	// We stop looking for a streak
			}
		}
		if (x < 7) {   
			for (i = x + 1; i < 8; i++) {	// Checking the items on the right
				if (map[y][i] == value)						// If the read item's value is the same as the adjacent item's value
				    row.push(get('#tile' + y + '_' + i));	// We add it to the items to remove
				else	// Otherwise
					break;	// We stop looking for a streak
			}
		}

		// Checking in the column
		if (y > 0) {
			for (var j = y - 1; j > -1; j--) {	// Checking the items on the left
				if (map[j][x] == value)						// If the read item's value is the same as the adjacent item's value
				    row.push(get('#tile' + j + '_' + x));	// We add it to the items to remove
				else	// Otherwise
					break;	// We stop looking for a streak
			}
		}
		if (y < 7) {   
			for (j = y + 1; j < 8; j++) {	// Checking the items on the right
				if (map[j][x] == value)						// If the read item's value is the same as the adjacent item's value
				    row.push(get('#tile' + j + '_' + x));	// We add it to the items to remove
				else	// Otherwise
					break;	// We stop looking for a streak
			}
		}

		// If we have a row of three identical items
		if (row.length > 1) {
		    for (var i = 0; i < row.length; i++) {
		    	game.itemsToRemove.push(row[i]);	// We will remove the items from the row
		    }
		}

		// If we have a column of three identical items
		if (column.length > 1) {
		    for (var i = 0; i < column.length; i++) {
		    	game.itemsToRemove.push(column[i]);	// We will remove the items from the column
		    }
		}

		// If we have a row or a column of three identical items
		if (row.length > 1 || column.length > 1) {
		    game.itemsToRemove.push(game.item.sprite);	// We know the moved item will be removed
			return true;	// We allow the removing
		}
		return false;
	},

	removeStreak: function() {
		console.log('game.itemsToRemove: ', game.itemsToRemove);
	}
};

window.onload = game.init();