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

	streak: [],
	newItems: [],
	animations: [],		// Contains the animations that are being performed

	/**
	 * Creates an item from its coordinates and tile value
	 */
	createItem: function(y, x, tile) {
		var item, left, top;
		left = ((60 * x) + 5 * (x + 1)) + 'px';
		top = ((60 * y) + 5 * (y + 1)) +'px';

		item = document.createElement('span');
		item.className = 'item tile_' + tile;
		item.id = 'tile' + y + '_' + x;
		item.style.top = top;
		item.style.left = left;
		item.style.backgroundImage = 'url("../images/sprites/' + tile + '.png")';
		item.style.backgroundRepeat = 'no-repeat';
		item.style.backgroundPosition = 'top center';
		item.style.border = 'solid 3px #000';

		return item;
	},

	/**
	 * Removes an item from the map
	 */
	removeItem: function(item) {
		// TODO animation
		get('#grid').removeChild(item);
		removeEvent(item, 'mousedown', game.startDrag);
	},

	/**
	 * Creates the grid for the level
	 */
	init: function() {
		var grid = get('#grid'), row, tile;

		for (var i = 0; i < 8; i++) {
			row = game.level.map[i];
			for (var j = 0, item; j < 8; j++) {
				tile = row[j];
				item = game.createItem(i, j, tile);
				addEvent(item, 'mousedown', game.startDrag);
				grid.appendChild(item);	// Adding the new tile on the grid
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
			targetValue = parseInt(target.className.substr(10, 1)),
			itemValue,
			item;

		addEvent(document, 'mouseup', game.stopDrag);	// We allow the moving to the adjacent items

		game.item.sprite = target;
		game.item.x = target.style.left;
		game.item.y = target.style.top;

		// We run through the item's row (the 2 adjacent items)
		for (var i = ((x > 0) ? x - 1 : 0); i <= ((x < 7) ? x + 1 : 7); i++) {
			item = get('#tile' + y + '_' + i);	// The item <span>
			itemValue = parseInt(item.className.substr(10, 1));	// The value (sprite) of the item

			if (item != target && item != null) {	// On the adjacent items, if the player moves his mouse over them, the selected item moves
				addEvent(item, 'mouseover', game.moveItem);
			}
		}

		// We run through the item's column (the 2 adjacent items)
		for (var j = ((y > 0) ? y - 1 : 0); j <= ((y < 7) ? y + 1 : 7); j++) {
			item = get('#tile' + j + '_' + x);	// The item <span>
			itemValue = parseInt(item.className.substr(10, 1));	// The value (sprite) of the item

			if (item != target && item != null) {	// On the adjacent items, if the player moves his mouse over them, the selected item moves
				addEvent(item, 'mouseover', game.moveItem);	// We allow the moving to the adjacent items
			}
		}
	},

	/**
	 * Stops the dragging of the selected item
	 */
	stopDrag: function(e) {
		var item,
			dragged = game.item.sprite,
			hovered = game.hovered,
			x = parseInt(dragged.id.substr(6, 1)),
			y = parseInt(dragged.id.substr(4, 1));

		// We remove the mouse event listeners
		removeEvent(document, 'mouseup', game.stopDrag);
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				item = get('#tile' + i + '_' + j);	// The item <span>
				if (item != null)
					removeEvent(item, 'mouseover', game.moveItem);
			}
		}

		// We manually complete the animations
		if (hovered != undefined) {
			for (var i = 0; i < game.animations.length; i++)
				clearInterval(game.animations[i]);
			dragged.style.left = ((60 * x) + 5 * (x + 1)) + 'px';
			dragged.style.top = ((60 * y) + 5 * (y + 1)) +'px';
			x = parseInt(hovered.id.substr(6, 1));
			y = parseInt(hovered.id.substr(4, 1));
			hovered.style.left = ((60 * x) + 5 * (x + 1)) + 'px';
			hovered.style.top = ((60 * y) + 5 * (y + 1)) +'px';
		}

		// We look for an item streak
		var item1Streak = game.checkStreak(game.item.sprite),
			item2Streak = game.hovered ? game.checkStreak(game.hovered) : false;

		if (item1Streak || item2Streak) {
			// TODO animation des disparitions
			setTimeout(function() {
				// We make the streak disappear
				game.removeStreak();

				// We generate random new items above the grid
				game.generateItems();

				// We make the remaining items fall
				game.itemsFall();

				// We reset the items information
				game.hovered = null;
				game.item = {
					sprite: null,
					x: null,
					y: null
				};

				game.streak = [];
				game.newItems = [];
			}, 500);
			// // We make the streak disappear
			// game.removeStreak();

			// // We generate random new items above the grid
			// game.generateItems();

			// // We make the remaining items fall
			// game.itemsFall();
		}else {
			if (game.hovered != null) {
				game.item.x = game.hovered.style.left;
				game.item.y = game.hovered.style.top;
				game.swapItems(game.hovered, game.item.sprite);	// We re-swap the items to their respective original positions
			}
			// We reset the items information
			game.hovered = null;
			game.item = {
				sprite: null,
				x: null,
				y: null
			};

			game.streak = [];
			game.newItems = [];
		}

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
			items = get('.item');

		if (source.style.left != dest.style.left) {
			game.animations.push(animate(source, 'left', source.style.left, dest.style.left, 8));	// We move the source sprite to its new position
			game.animations.push(animate(dest, 'left', dest.style.left, source.style.left, 8));	// We move the dest sprite to its new position
		}
		if (source.style.top != dest.style.top){
			game.animations.push(animate(source, 'top', source.style.top, dest.style.top, 8));	// We move the source sprite to its new position
			game.animations.push(animate(dest, 'top', dest.style.top, source.style.top, 8));	// We move the dest sprite to its new position
		}
		
		source.id = 'tile' + destY + '_' + destX;
		dest.id = 'tile' + sourceY + '_' + sourceX;

		game.item.x = source.style.left;
		game.item.y = source.style.top;

		// Once moved, the item cannot be moved again
		for (var i = 0; i < items.length; i++) {
			removeEvent(items[i], 'mouseover', game.moveItem);
		}
	},

	/**
	 * Searches for the presence of an item streak
	 */
	checkStreak: function(item) {
		var x = parseInt(item.id.substr(6, 1)),
			y = parseInt(item.id.substr(4, 1)),
			row = [],
			column = [];

		// Checking in the row
		row = game.checkRow(item, x, y);

		// Checking in the column
		column = game.checkColumn(item, x, y);

		// If we have a row of three identical items
		if (row.length > 1) {
			for (var i = 0; i < row.length; i++) {
				if (game.streak.indexOf(row[i]) == -1)
					game.streak.push(row[i]);	// We will remove the items from the row
			}
		}

		// If we have a column of three identical items
		if (column.length > 1) {
			for (var i = 0; i < column.length; i++) {
				if (game.streak.indexOf(column[i]) == -1)
					game.streak.push(column[i]);	// We will remove the items from the column
			}
		}
 
		// If we have a row or a column of three identical items
		if ((row.length > 1 || column.length > 1) && game.streak.indexOf(item) == -1) {
			game.streak.push({
				sprite: item,
				'x': x,
				'y': y
			});	// We know the moved item will be removed
			return true;	// We allow the removing
		}


		/*** Remove comment if we want additionnal streaks with rows and lines ***/
		// If we have a row or a column of three identical items
		// if ((row.length > 1 || column.length > 1)) {
		// 	// Rows
		// 	for (var i = 0; i < row.length; i++) {
		// 		if (game.streak.indexOf(row[i]) == -1)
		// 			game.streak.push(row[i]);	// We will remove the items from the row
		// 	}
			
		// 	// Columns
		// 	for (var i = 0; i < column.length; i++) {
		// 		if (game.streak.indexOf(column[i]) == -1)
		// 			game.streak.push(column[i]);	// We will remove the items from the column
		// 	}

		// 	// The moved item
		// 	if (game.streak.indexOf(item) == -1)
		// 		game.streak.push({
		// 			sprite: item,
		// 			x: x,
		// 			y: y
		// 		});	// We know the moved item will be removed
		// 	return true;	// We allow the removing
		// }
		// return false;
	},

	/**
	 * Checks for a streak in the item's column
	 */
	checkColumn: function(item, x, y) {
		var column = [],
			itemsNb = 0,
			siblingCheck,
			currentItem,
			currentItemRow = [],
			value = parseInt(item.className.substr(10, 1));	// The value (sprite) of the item
		
		// Checking the items on top
		if (y > 0) {
			for (var j = y - 1; j > -1; j--) {
				currentItem = get('#tile' + j + '_' + x);
				siblingCheck = game.siblingCheck(currentItem, column, x, j, value, true);
				if (siblingCheck != false) 
				    column = siblingCheck;
				else
					break;
				
				itemsNb++;
			}
		}

		// Checking the items on bottom
		if (y < 7) {
			for (j = y + 1; j < 8; j++) {
				currentItem = get('#tile' + j + '_' + x);
				siblingCheck = game.siblingCheck(currentItem, column, x, j, value, true);
				if (siblingCheck != false) 
				    column = siblingCheck;
				else
					break;
				
				itemsNb++;
			}
		}

		/*** Remove comment if we want additionnal streaks with rows and lines ***/
		// if (item == game.item.sprite || item == game.hovered) {
		// 	if (itemsNb > 1)
		// 		return column;
		// 	return [];
		// }else{
		// 	return column;
		// }
		return column;
	},

	/**
	 * Checks for a streak in the item's row
	 */
	checkRow: function(item, x, y) {
		var row = [],
			itemsNb = 0,
			siblingCheck,
			currentItem,
			currentItemColumn = [],
			value = parseInt(item.className.substr(10, 1));	// The value (sprite) of the item
		// Checking the items on the left
		if (x > 0) {
			for (var i = x - 1; i > -1; i--) {
				currentItem = get('#tile' + y + '_' + i);
				siblingCheck = game.siblingCheck(currentItem, row, i, y, value, false);
				if (siblingCheck != false) 
				    row = siblingCheck;
				else
					break;

				itemsNb++;
			}
		}


		// Checking the items on the right
		if (x < 7) {
			for (i = x + 1; i < 8; i++) {
				currentItem = get('#tile' + y + '_' + i);
				siblingCheck = game.siblingCheck(currentItem, row, i, y, value, false);
				if (siblingCheck != false) 
				    row = siblingCheck;
				else
					break;

				itemsNb++;
			}
		}

		/*** Remove comment if we want additionnal streaks with rows and lines ***/
		// if (item == game.item.sprite || item == game.hovered) {	// If this is the 'main' row check
		// 	if (itemsNb > 1)	// We only consider rows that have more than 1 items in them
		// 		return row;
		// 	return [];
		// }else {
		// 	return row;
		// }
		return row;
	},

	/**
	 * Check if the adjacent item of a given item is identical (vertically or horizontally)
	 */
	siblingCheck: function(item, line, i, j, value, vertical) {
		if (parseInt(item.className.substr(10, 1)) == value && item != game.item.sprite)	{		// If the read item's value is the same as the adjacent item's value
			if (line.indexOf(item) == -1)	// And the item was not already detected
				line.push({
					sprite: item,
					x: i,
					y: j
				});	// We add it to the items to remove
			
			/*** Remove comment if we want additionnal streaks with rows and lines ***/
			// var currentItemLine = vertical ? game.checkRow(item, i, j) : game.checkColumn(item, i, j);	// We check for its adjacent items
			// for (var i = 0; i < currentItemLine.length; i++)		// If there are, we add them to the items to remove too
			// 	line.push(currentItemLine[i]);
			return line;
		}
		return false;	// We stop looking for a streak
	},

	/**
	 * Removes all the items that form a streak (line or row, or both)
	 */
	removeStreak: function() {
		for (var i = 0; i < game.streak.length; i++)
			game.removeItem(game.streak[i].sprite);
	},

	/**
	 * Makes the remaining items fall after a streak disappeared
	 */	
	itemsFall: function() {
		var columns = {	// The columns which contain items that must fall
			indexes: {},
		};
		
		for (var i = 0, x, y; i < game.streak.length; i++) {
			x = game.streak[i].x;
			y = game.streak[i].y;

			if (!columns.indexes.hasOwnProperty(x)){
				columns.indexes[x] = 1;
				columns['yMin' + x] = 8;
				columns['yMax' + x] = 0;
			}else if (game.newItems.indexOf(game.streak[i]) == -1) {	// We only count the items that were removed, not the new ones
				columns.indexes[x]++;
			}
			
			if (y < columns['yMin' + x])	// If the current item's y is inferior to the y coordinate from all the other items in its column
				columns['yMin' + x] = y;
			if (y > columns['yMax' + x])	// If the current item's y is inferior to the y coordinate from all the other items in its column
				columns['yMax' + x] = y;
		}

		for (var i = 0, yMin, yMax; i < Object.getLength(columns.indexes); i++) {
			var item, top, newY, keys = Object.getKeys(columns.indexes), nbItems = columns.indexes[keys[i]];
			yMin = columns['yMin' + keys[i]];
			yMax = columns['yMax' + keys[i]];

			for (var j = (yMax - nbItems); j >= yMin; j--) {	// We run through the items
				item = get('#tile' + j + '_' + keys[i]);
				if (item != null) {
					top = item.style.top;
					top = parseInt(top.substring(0, top.length - 2));
					top += 60 * nbItems + 5 * nbItems;
					top += 'px';

					// TODO animation
					animate(item, 'top', item.style.top, top, 4);	// We move the item to its new position

					newY = j + nbItems;
					item.id = 'tile' + newY + '_' + keys[i];	// Setting the new position on the id property
				}
			}
		}
	},

	/**
	 * Generates random items above the grid after a streak disappeared
	 */
	generateItems: function() {
		var i, item, y, tile, itemsNb = game.streak.length, columns = {}, newItem;

		for (i = 0; i < itemsNb; i++) {
			x = game.streak[i].x;

			if (!columns.hasOwnProperty('column' + x)) 	// If the items from this column have not been counted yet
				columns['column' + x] = 1;	// We start to count
			else	// Otherwise
				columns['column' + x]++;	// We add this item to the count

			y = 0 - columns['column' + x];	// And then we calculate the necessary shift on the Y axis
			tile = parseInt(Math.random() * game.level.range);

			item = game.createItem(y, x, tile);
			addEvent(item, 'mousedown', game.startDrag);
			grid.appendChild(item);	// Adding the new tile on the grid
			item.id = 'tile' + y + '_' + x;	// Setting the new position on the id property

			newItem = {
				sprite: item,
				'x': x,
				'y': y
			};
			game.streak.push(newItem);
			game.newItems.push(newItem)
		}
	}
};

window.onload = game.init();