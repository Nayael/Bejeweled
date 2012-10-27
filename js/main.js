// This variable represents the instance of the game
var game = {
	lvlIndex: 0,		// The current level index
	level: levels[0],	// The current level object
	hovered: null,		// The hovered item to swap with
	item: null,			// The selected item
	streak: [],

	/**
	 * Removes an item from the map
	 * @param item	The item to remove
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
		var grid = get('#grid'), row, value;

		for (var i = 0; i < 8; i++) {
			row = game.level.map[i];
			for (var j = 0, item; j < 8; j++) {
				value = row[j];
				item = new Item(j, i, value);
				addEvent(item, 'mousedown', game.startDrag);	// We add the mouse event listener
				grid.appendChild(item);
			}
		}
	},

	/**
	 * Initializes the dragging of the clicked item
	 * @param e	The mouse event
	 */
	startDrag: function(e) {
		var target = e.target || e.srcElement,
			x = target.x(),
			y = target.y(),
			targetValue = target.value(),
			itemValue,
			item;

		game.item = target;
		addEvent(document, 'mouseup', game.stopDrag);	// We allow the moving to the adjacent items

		// We run through the item's row (the 2 adjacent items)
		for (var i = ((x > 0) ? x - 1 : 0); i <= ((x < 7) ? x + 1 : 7); i++) {
			item = get('#tile' + y + '_' + i);	// The item <span>
			itemValue = item.value();

			if (item != target && item != null) {
				addEvent(item, 'mouseover', game.moveItem);
			}
		}

		// We run through the item's column (the 2 adjacent items)
		for (var j = ((y > 0) ? y - 1 : 0); j <= ((y < 7) ? y + 1 : 7); j++) {
			item = get('#tile' + j + '_' + x);
			itemValue = item.value();

			if (item != target && item != null) {
				addEvent(item, 'mouseover', game.moveItem);
			}
		}
	},

	/**
	 * Stops the dragging of the selected item
	 * @param e	The mouse event
	 */
	stopDrag: function(e) {
		var item,
			dragged = game.item,
			hovered = game.hovered,
			x = dragged.x(),
			y = dragged.y();

		// We remove the mouse event listeners
		removeEvent(document, 'mouseup', game.stopDrag);
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				item = get('#tile' + i + '_' + j);
				if (item != null)
					removeEvent(item, 'mouseover', game.moveItem);
			}
		}

		// We manually complete the animations
		if (hovered != undefined) {
			clearInterval(dragged);
			clearInterval(hovered);
			dragged.animated = false;
			hovered.animated = false;

			dragged.left((60 * x) + 5 * (x + 1));
			dragged.top((60 * y) + 5 * (y + 1));
			x = hovered.x();
			y = hovered.y();
			hovered.left((60 * x) + 5 * (x + 1));
			hovered.top((60 * y) + 5 * (y + 1));
		}

		// We look for an item streak
		var item1Streak = game.checkStreak(game.item),
			item2Streak = game.hovered ? game.checkStreak(game.hovered) : false;

		if (item1Streak || item2Streak) {
			var items = get('.item')
			for (var i = 0; i < items.length; i++) {
				removeEvent(items[i], 'mousedown', game.startDrag);
			}

			setTimeout(function() {	// We continue after the streak disappeared
				game.removeStreak();
				var newItems = game.generateItems();
				game.itemsFall(newItems);
				game.checkCombos();

				// We reset the items information
				game.hovered = null;
				game.item = null;
				game.streak = [];
			}, 300);
		}else {
			if (game.hovered != null) {
				game.swapItems(game.hovered, game.item);	// We re-swap the items to their respective original positions
			}
			// We reset the items information
			game.hovered = null;
			game.item = null;
			game.streak = [];
		}

	},

	/**
	 * Moves the dragged item to the hovered item's position
	 * @param e	The mouse event
	 */
	moveItem: function(e) {
		game.hovered = e.target || e.srcElement;
		game.swapItems(game.item, game.hovered);
	},

	/**
	 * Swaps two items
	 * @param source	The first item to swap
	 * @param dest	The second item to swap with the first one
	 */
	swapItems: function(source, dest) {
		var sourceX = source.x(),
			sourceY = source.y(),
			destX = dest.x(),
			destY = dest.y(),
			sourceValue = source.value(),
			destValue = dest.value(),
			items = get('.item');

		// We animate the items to their new positions
		if (source.left() != dest.left()) {
			source.animate('left', source.left(), dest.left(), 8);
			dest.animate('left', dest.left(), source.left(), 8);
		}
		if (source.top() != dest.top()) {
			source.animate('top', source.top(), dest.top(), 8);	
			dest.animate('top', dest.top(), source.top(), 8);
		}
		
		// We swap the x and y properties
		source.x(destX);
		source.y(destY);
		dest.x(sourceX);
		dest.y(sourceY);

		// Once moved, the item cannot be moved again
		for (var i = 0; i < items.length; i++) {
			removeEvent(items[i], 'mouseover', game.moveItem);
		}
	},

	/**
	 * Searches for the presence of an item streak
	 * @param item	The item which column and row will be parsed
	 * @return True if there is a streak, false if there is not
	 */
	checkStreak: function(item) {
		var x = item.x(),
			y = item.y(),
			row = [],
			column = [];

		row = game.checkRow(item);
		column = game.checkColumn(item);

		// If we have a row of three identical items
		if (row.length > 1) {
			for (var i = 0; i < row.length; i++) {
				if (game.streak.indexOf(row[i]) == -1)
					game.streak.push(row[i]);
			}
		}

		// If we have a column of three identical items
		if (column.length > 1) {
			for (var i = 0; i < column.length; i++) {
				if (game.streak.indexOf(column[i]) == -1)
					game.streak.push(column[i]);
			}
		}
 
		// If we have a row or a column of three identical items
		if ((row.length > 1 || column.length > 1) && game.streak.indexOf(item) == -1) {
			game.streak.push(item);	// We know the moved item will be removed
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
		// 		game.streak.push(item);	// We know the moved item will be removed
		// 	return true;	// We allow the removing
		// }
		return false;
	},

	/**
	 * Checks for a streak in the item's column
	 * @param item	The item which column will be parsed
	 * @return An array containing the identical adjacent items in the column
	 */
	checkColumn: function(item) {
		var column = [],
			x = item.x(),
			y = item.y(),
			itemsNb = 0,
			siblingCheck,
			currentItem,
			currentItemRow = [],
			value = item.value();
		
		// Checking the items on top
		if (y > 0) {
			for (var j = y - 1; j > -1; j--) {
				currentItem = get('#tile' + j + '_' + x);
				siblingCheck = game.siblingCheck(currentItem, column, value, true);
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
				siblingCheck = game.siblingCheck(currentItem, column, value, true);
				if (siblingCheck != false) 
				    column = siblingCheck;
				else
					break;
				
				itemsNb++;
			}
		}

		/*** Remove comment if we want additionnal streaks with rows and lines ***/
		// if (item == game.item || item == game.hovered) {
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
	 * @param item	The item which row will be parsed
	 * @return An array containing the identical adjacent items in the row
	 */
	checkRow: function(item) {
		var row = [],
			x = item.x(),
			y = item.y(),
			itemsNb = 0,
			siblingCheck,
			currentItem,
			currentItemColumn = [],
			value = item.value();

		// Checking the items on the left
		if (x > 0) {
			for (var i = x - 1; i > -1; i--) {
				currentItem = get('#tile' + y + '_' + i);
				siblingCheck = game.siblingCheck(currentItem, row, value, false);
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
				siblingCheck = game.siblingCheck(currentItem, row, value, false);
				if (siblingCheck != false) 
				    row = siblingCheck;
				else
					break;
				itemsNb++;
			}
		}

		/*** Remove comment if we want additionnal streaks with rows and lines ***/
		// if (item == game.item || item == game.hovered) {	// If this is the 'main' row check
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
	 * @param item	The item which siblings will be parsed
	 * @param line	An array containing the siblings that we already know are in a streak
	 * @param value	The value (sprite) of the source item
	 * @param vertical	Should we check vertically or horizontally ?
	 * @return An array containing the identical adjacent items | false if the array is empty
	 */
	siblingCheck: function(item, line, value, vertical) {
		if (item.value() == value && item != game.item)	{
			if (line.indexOf(item) == -1)
				line.push(item);	// We add it to the items to remove
			
			/*** Remove comment if we want additionnal streaks with rows and lines ***/
			// var currentItemLine = vertical ? game.checkRow(item) : game.checkColumn(item);	// We check for its adjacent items
			// for (var i = 0; i < currentItemLine.length; i++)
			// 	line.push(currentItemLine[i]);
			return line;
		}
		return false;	// We stop looking for a streak
	},

	checkCombos: function() {
		
	},

	/**
	 * Removes all the items that form a streak (line or row, or both)
	 */
	removeStreak: function() {
		for (var i = 0; i < game.streak.length; i++)
			game.removeItem(game.streak[i]);
	},

	/**
	 * Makes the remaining items fall after a streak disappeared
	 * @param newItems	The items that were generated after the streak
	 */	
	itemsFall: function(newItems) {
		var columns = {	// The columns which contain items that must fall
			indexes: {},
		};
		for (var i = 0, x, y; i < game.streak.length; i++) {
			x = game.streak[i].x();
			y = game.streak[i].y();

			if (!columns.indexes.hasOwnProperty(x)){
				columns.indexes[x] = 1;
				columns['yMin' + x] = 8;
				columns['yMax' + x] = 0;
			}else if (newItems.indexOf(game.streak[i]) == -1) {	// We only count the items that were removed, not the new ones
				columns.indexes[x]++;
			}
			
			if (y < columns['yMin' + x])
				columns['yMin' + x] = y;
			if (y > columns['yMax' + x])
				columns['yMax' + x] = y;
		}

		for (var i = 0, yMin, yMax; i < Object.getLength(columns.indexes); i++) {
			var item, top, keys = Object.getKeys(columns.indexes), nbItems = columns.indexes[keys[i]];
			yMin = columns['yMin' + keys[i]];
			yMax = columns['yMax' + keys[i]];

			for (var j = (yMax - nbItems); j >= yMin; j--) {	// We run through the items
				item = get('#tile' + j + '_' + keys[i]);
				if (item != null) {
					top = item.top();
					top = parseInt(top.substring(0, top.length - 2));
					top += 60 * nbItems + 5 * nbItems;
					top += 'px';

					item.animate('top', item.top(), top, 6);	// We move the item to its new position
					item.x(keys[i]);
					item.y(j + nbItems);
				}
			}
		}
	},

	/**
	 * Generates random items above the grid after a streak disappeared
	 * @return An array of the new generated items
	 */
	generateItems: function() {
		var i, item, y, tile, itemsNb = game.streak.length, columns = {}, newItems = [];

		for (i = 0; i < itemsNb; i++) {
			x = game.streak[i].x();
			if (!columns.hasOwnProperty('column' + x))
				columns['column' + x] = 1;	// We start to count
			else	// Otherwise
				columns['column' + x]++;	// We add this item to the count

			y = 0 - columns['column' + x];	// And then we calculate the necessary shift on the Y axis
			tile = parseInt(Math.random() * game.level.range);

			item = new Item(x, y, tile);
			addEvent(item, 'mousedown', game.startDrag);
			grid.appendChild(item);
			item.x(x);
			item.y(y);

			game.streak.push(item);
			newItems.push(item);
		}
		return newItems;
	},

	/**
	 * Triggers every time an item's fall is complete
	 * Add the mouse event listeners to all the items, once all the animations are done
	 */
	onFallComplete: function() {
		for (var i = 0; i < game.streak.length; i++) {
			if (game.streak[i].animated)	// If at least one item is still being animated
				return;
		}
		// If all the animations are finished, we allow the player to move items again
		var items = get('.item');
		for (var i = 0; i < items.length; i++) {
			addEvent(items[i], 'mousedown', game.startDrag);
		}
	}
};

window.onload = game.init();