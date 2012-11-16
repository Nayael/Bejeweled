// This variable represents the instance of the game
var game = {
	lvlIndex: 0,		// The current level index
	level: levels[0],	// The current level object
	hovered: null,		// The hovered item to swap with
	item: null,			// The selected item

	/**
	 * Removes an item from the map
	 * @param item	The item to remove
	 */
	removeItem: function(item) {
		item.explode();
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
				item.addEventListener('click', game.onItemClick, false);	// We add the mouse event listener
				grid.appendChild(item);
			}
		}
	},

	/**
	 * Triggers when an item is clicked (select it or proceed to the swap)
	 * @param e	The mouse event
	 */
	onItemClick: function (e) {
		var target = e.srcElement || e.target;
		if (game.item == null) {
			game.selectItem(target);
		}else {
			if (target.isAdjacent(game.item)) {		// If the clicked item is adjacent to the first selected item
				game.swapItems(game.item, target, true);	// We can swap them
			}else {							// Otherwise
				game.selectItem(target);	// We select the new one
			}
		}
	},

	/**
	 * Makes a given item the game's selected item
	 * @param item	The item to select
	 */
	selectItem: function (item) {
		game.deselectItem();
		if (game.item == null || item.id !== game.item.id) {
			item.style.border = 'solid 3px #000';
			game.item = item;
		}
	},

	/**
	 * Deselects the game's selected item
	 */
	deselectItem: function () {
		if (game.item != null) {
			game.item.style.border = '';
			game.item = null;   
		}
	},

	/**
	 * Swaps two items
	 * @param source	The first item to swap
	 * @param dest	The second item to swap with the first one
	 */
	swapItems: function(source, dest, check) {
		var sourceX = source.x(),
			sourceY = source.y(),
			destX = dest.x(),
			destY = dest.y();

		// We animate the items to their new positions
		if (source.left() != dest.left() || source.top() != dest.top()) {
			var items = get('.item');
			for (var i = 0; i < items.length; i++) {
				items[i].removeEventListener('click', game.onItemClick, false);	// We add the mouse event listener
			};
			if (check === true) {
				source.addListener(MOVE_COMPLETE, game.checkStreak);// Once the animation is over, check for a streak around the item
				dest.addListener(MOVE_COMPLETE, game.checkStreak);	// Once the animation is over, check for a streak around the item
			}

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
		}
	},

	/**
	 * Looks for the presence and removes a streak around an item
	 * @param item	The item wich neighbours will be checked for a streak
	 */
	checkStreak: function(item) {
		item.removeListener(MOVE_COMPLETE, game.checkStreak);	// Once the animation is over, check for a streak around the items
		var items = get('.item'),
			streak = [];

		// We look for an item streak
		streak = game.getStreak(item);

		if (streak.length > 0) {
			item.inStreak = true;
			game.removeStreak(streak);
			setTimeout(function() {		// We continue after the streak disappeared
				var itemsGenerated = game.generateItems(streak);
				var newItems = itemsGenerated.newItems;
				streak = itemsGenerated.streak;
				game.itemsFall(newItems, streak);

				game.deselectItem();
			}, 500);
		}else if (game.item != null && game.item.id !== item.id && !game.item.inStreak) {	// If there is a selected item, and it is not in a streak, we will have to reverse the swap
			game.swapItems(item, game.item, false);		// We re-swap the items to their respective original positions
			game.deselectItem();
			
			for (var i = 0; i < items.length; i++) {
				items[i].addEventListener('click', game.onItemClick, false);	// We add the mouse event listener
			};
		}
	},

	/**
	 * Searches for the presence of an item streak
	 * @param item	The item which column and row will be parsed
	 * @param streak	An array containing the items that are in a streak
	 * @return The streak array with the streaked items in it
	 */
	getStreak: function(item) {
		var x = item.x(),
			y = item.y(),
			row = [],
			column = [],
			streak = [];

		row = game.checkRow(item, true, true);
		column = game.checkColumn(item, true, true);

		// If we have a row of three identical items
		if (row.length > 1) {
			for (var i = 0; i < row.length; i++) {
				if (streak.indexOf(row[i]) == -1) {
					streak.push(row[i]);
					row[i].inStreak = true;
				}
			}
		}

		// If we have a column of three identical items
		if (column.length > 1) {
			for (var i = 0; i < column.length; i++) {
				if (streak.indexOf(column[i]) == -1) {
					streak.push(column[i]);
					column[i].inStreak = true;
				}
			}
		}
 
		// If we have a row or a column of three identical items
		if ((row.length > 1 || column.length > 1) && streak.indexOf(item) == -1) {
			streak.push(item);	// We know the moved item will be removed
		}


		/*** Remove comment if we want additionnal streaks with rows and lines ***/
		// If we have a row or a column of three identical items
		// if ((row.length > 1 || column.length > 1)) {
		// 	// Rows
		// 	for (var i = 0; i < row.length; i++) {
		// 		if (streak.indexOf(row[i]) == -1)
		// 			streak.push(row[i]);	// We will remove the items from the row
		// 	}
			
		// 	// Columns
		// 	for (var i = 0; i < column.length; i++) {
		// 		if (streak.indexOf(column[i]) == -1)
		// 			streak.push(column[i]);	// We will remove the items from the column
		// 	}

		// 	// The moved item
		// 	if (streak.indexOf(item) == -1)
		// 		streak.push(item);	// We know the moved item will be removed
		// }
		return streak;
	},

	/**
	 * Searches for the presence of an item streak
	 * @param item	The item which column and row will be parsed
	 * @param vertical	bool	Check vertically or horizontally ?
	 * @param step	int	(-1 OR 1) Check on one direction or another (left/right, top/bottom)
	 * @return The streak array with the streaked items in it
	 */
	parseNeighbours: function (item, vertical, step) {
		var line = [],
			i = 0,
			x = item.x(),
			y = item.y(),
			siblingCompare,
			currentItem,
			value = item.value();

		// We run through the items in one direction. The step indicates if we go one way or another on the X or Y axis (the axis is defined by the 'vertical' parameter)
		for (i = ((vertical ? y : x) + step); (step == -1) ? (i > -1) : (i < 8); i += step) {
			if (vertical) {
				currentItem = get('#tile' + i + '_' + x);	// The current parsed item
			}else {
				currentItem = get('#tile' + y + '_' + i);	// The current parsed item
			}

			siblingCompare = game.siblingCompare(currentItem, line, value, true);	// We check if this sibling is identical
			if (siblingCompare != false) 
				line = siblingCompare;
			else
				break;
		}
		return line;
	},

	/**
	 * Checks for a streak in the item's column
	 * @param item	The item which column will be parsed
	 * @return An array containing the identical adjacent items in the column
	 */
	checkColumn: function(item, top, bottom) {
		if (top !== true && bottom !== true) {
			return;
		}
		
		var column = [];	
		// Checking the items on top (if the item is at an extremity, don't check behind the border)
		if (top && item.y() > 0) {
			column = column.concat(game.parseNeighbours(item, true, -1));
		}

		// Checking the items on bottom (if the item is at an extremity, don't check behind the border)
		if (bottom && item.y() < 7) {
			column = column.concat(game.parseNeighbours(item, true, 1));
		}

		/*** Remove comment if we want additionnal streaks with rows and lines ***/
		// if (item == game.item || item == game.hovered) {
		// 	if (itemsNb > 1)
		// 		return column;
		// 	return [];
		// }
		return column;
	},

	/**
	 * Checks for a streak in the item's row
	 * @param item	The item which row will be parsed
	 * @return An array containing the identical adjacent items in the row
	 */
	checkRow: function(item, left, right) {
		if (left !== true && right !== true) {
			return;
		}

		var row = [];
		// Checking the items on the left
		if (left && item.x() > 0) {
			row = row.concat(game.parseNeighbours(item, false, -1));
		}

		// Checking the items on the right
		if (right && item.x() < 7) {
			row = row.concat(game.parseNeighbours(item, false, 1));
		}

		/*** Remove comment if we want additionnal streaks with rows and lines ***/
		// if (item == game.item || item == game.hovered) {	// If this is the 'main' row check
		// 	if (itemsNb > 1)	// We only consider rows that have more than 1 items in them
		// 		return row;
		// 	return [];
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
	siblingCompare: function(item, line, value, vertical) {
		// console.log('item: ', item);
		if (item.value() == value && item != game.item)	{
			if (line.indexOf(item) == -1 && !item.falling)
				line.push(item);	// We add it to the items to remove
			
			/*** Remove comment if we want additionnal streaks with rows and lines ***/
			// var currentItemLine = vertical ? game.checkRow(item) : game.checkColumn(item);	// We check for its adjacent items
			// for (var i = 0; i < currentItemLine.length; i++)
			// 	line.push(currentItemLine[i]);
			return line;
		}
		return false;	// We stop looking for a streak
	},

	/**
	 * Checks if there is a streak among the new generated items
	 * @param item	The item which siblings will be parsed
	 */
	checkComboStreak: function(item) {
		var streak = game.getStreak(item, []);
		if (streak.length > 0) {
			game.removeStreak(streak);
			setTimeout(function() {	// We continue after the streak disappeared
				var itemsGenerated = game.generateItems(streak);
				var newItems = itemsGenerated.newItems;
				streak = itemsGenerated.streak;
				// console.log('newItems: ', newItems);
				game.itemsFall(newItems, streak);
			}, 500);
		}
	},

	/**
	 * Removes all the items that form a streak (line or row, or both)
	 * @param streak	An array containing the items that are in a streak
	 */
	removeStreak: function(streak) {
		for (var i = 0; i < streak.length; i++)
			game.removeItem(streak[i]);
	},

	/**
	 * Makes the remaining items fall after a streak disappeared
	 * @param newItems	The items that were generated after the streak
	 * @param streak	An array containing the items that are in a streak
	 */	
	itemsFall: function(newItems, streak) {
		var columns = {			// The columns which contain items that must fall
			indexes: {},
		};
		for (var i = 0, x, y; i < streak.length; i++) {
			x = streak[i].x();
			y = streak[i].y();

			if (!columns.indexes.hasOwnProperty(x)){
				columns.indexes[x] = 1;
				columns['yMin' + x] = 8;
				columns['yMax' + x] = 0;
			}else if (newItems.indexOf(streak[i]) == -1) {	// We only count the items that were removed, not the new ones
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

					item.falling = true;
					item.animate('top', item.top(), top, 6);	// We move the item to its new position
					console.log('item: ', item);
					item.x(keys[i]);
					item.y(j + nbItems);
				}
			}
		}
	},

	/**
	 * Triggers every time an item's fall is complete
	 * Add the mouse event listeners to all the items, once all the animations are done
	 * @param item	The item which fall is complete
	 */
	onFallComplete: function(item) {
		item.falling = false;
		var items = get('.item');
		
		for (var i = 0; i < items.length; i++) {
			if (items[i].animated)	// If at least one item is still being animated
				return;
		};

		// If all the animations are finished, we allow the player to move items again
		for (var i = 0; i < items.length; i++) {
			game.checkComboStreak(items[i]);	// And we check if there is a streak among his new neighbours
			items[i].addEventListener('click', game.onItemClick, false);	// We add the mouse event listener
		};
	},

	/**
	 * Generates random items above the grid after a streak disappeared
	 * @param streak	An array containing the items that are in a streak
	 * @return An array of the new generated items
	 */
	generateItems: function(streak) {
		var i, item, y, tile, itemsNb = streak.length, columns = {}, newItems = [];

		for (i = 0; i < itemsNb; i++) {
			x = streak[i].x();
			if (!columns.hasOwnProperty('column' + x))
				columns['column' + x] = 1;	// We start to count
			else	// Otherwise
				columns['column' + x]++;	// We add this item to the count

			y = 0 - columns['column' + x];	// And then we calculate the necessary shift on the Y axis
			tile = parseInt(Math.random() * game.level.range);

		// PROBLEM : Items with the same ids are generated
			item = new Item(x, y, tile);
			item.addEventListener('click', game.onItemClick, false);	// We add the mouse event listener
			grid.appendChild(item);
			item.x(x);
			item.y(y);

			streak.push(item);
			newItems.push(item);
		}
		return {
			newItems: newItems,
			streak: streak
		};
	}
};

window.onload = game.init();