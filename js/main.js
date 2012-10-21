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
		console.log('startDrag');
		var target = e.target || e.srcElement,
			x = parseInt(target.id.substr(4, 1)),
			y = parseInt(target.id.substr(6, 1)),
			targetValue = game.level.map[x][y],
			itemValue,
			item;

		addEvent(document, 'mouseup', game.stopDrag);	// We allow the moving to the adjacent items

		// We run through the item's row (the 2 adjacent items)
		for (var i = ((x > 0) ? x - 1 : 0); i <= ((x < 7) ? x + 1 : 7); i++) {
			itemValue = game.level.map[i][y],	// The value (sprite) of the item
			item = get('#tile' + i + '_' + y);	// The item <span>

			if (item != target) {	// On the adjacent items, if the player moves his mouse over them, the selected item moves
				addEvent(item, 'mouseover', game.switchItems);
			}
		}

		// We run through the item's column (the 2 adjacent items)
		for (var j = ((y > 0) ? y - 1 : 0); j <= ((y < 7) ? y + 1 : 7); j++) {
			itemValue = game.level.map[x][j],	// The value (sprite) of the item
			item = get('#tile' + x + '_' + j);	// The item <span>

			if (item != target) {	// On the adjacent items, if the player moves his mouse over them, the selected item moves
				addEvent(item, 'mouseover', game.switchItems);	// We allow the moving to the adjacent items
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
		console.log('stopDrag');
		var map = game.level.map, item;

		// We reset the selected item
		game.item = {
			sprite: null,
			offsetX: null,
			offsetY: null
		};

		// We remove the mouse event listeners
		removeEvent(document, 'mouseup', game.stopDrag);
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				item = get('#tile' + i + '_' + j);	// The item <span>
				removeEvent(item, 'mouseover', game.switchItems);
			}
		}
	},

	/**
	 * Moves the dragged item to the hovered item's position
	 */
	switchItems: function(e) {
		var selected = game.item.sprite,
			hovered = e.target || e.srcElement,
			selectedX = parseInt(selected.id.substr(4, 1)),
			selectedY = parseInt(selected.id.substr(6, 1)),
			selectedValue = parseInt(selected.className.substr(10, 1)),
			hoveredX = parseInt(hovered.id.substr(4, 1)),
			hoveredY = parseInt(hovered.id.substr(6, 1)),
			hoveredValue = parseInt(hovered.className.substr(10, 1)),
			items = get('.item'),
			map = game.level.map;

		// IF CHECK LINE, FAIRE CE QU'IL Y A EN DESSOUS

		// We move the selected sprite to its new position
		selected.style.left = hovered.style.left
		selected.style.top = hovered.style.top;
		selected.id = 'tile' + hoveredX + '_' + hoveredY;

		// We move the hovered sprite to its new position
		hovered.style.left = game.item.x;
		hovered.style.top = game.item.y;
		hovered.id = 'tile' + selectedX + '_' + selectedY;

		game.item.x = selected.style.left;
		game.item.y = selected.style.top;

		// We replace their values in the map
		map[selectedY][selectedX] = hoveredValue;
		map[hoveredY][hoveredX] = selectedValue;

		// Once moved, the item cannot be moved again
		for (var i = 0; i < items.length; i++) {
			removeEvent(items[i], 'mouseover', game.switchItems);
		};

		// FAIRE DISPARAITRE LES ITEMS, PUIS COMBO, ETC.
	}
};
game.init();