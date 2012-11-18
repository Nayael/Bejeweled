// This variable represents the instance of the game
var game = {
	lvlIndex: 0,		// The current level index
	level: levels[0],	// The current level object
	hovered: null,		// The hovered gem to swap with
	gem: null,			// The selected gem

	/**
	 * Removes an gem from the map
	 * @param gem	The gem to remove
	 */
	removeGem: function(gem) {
		gem.explode();
		removeEvent(gem, 'mousedown', game.startDrag);
	},

	/**
	 * Creates the grid for the level
	 */
	init: function() {
		var grid = get('#grid'), row, value;

		for (var i = 0; i < 8; i++) {
			row = game.level.map[i];
			for (var j = 0, gem; j < 8; j++) {
				value = row[j];
				gem = new Gem(j, i, value);
				gem.addEventListener('click', game.onGemClick, false);	// We add the mouse event listener
				grid.appendChild(gem);
			}
		}
	},

	/**
	 * Triggers when an gem is clicked (select it or proceed to the swap)
	 * @param e	The mouse event
	 */
	onGemClick: function (e) {
		var target = e.srcElement || e.target;
		if (game.gem == null) {
			game.selectGem(target);
		}else {
			if (target.isAdjacent(game.gem)) {		// If the clicked gem is adjacent to the first selected gem
				game.swapGems(game.gem, target, true);	// We can swap them
			}else {							// Otherwise
				game.selectGem(target);	// We select the new one
			}
		}
	},

	/**
	 * Makes a given gem the game's selected gem
	 * @param gem	The gem to select
	 */
	selectGem: function (gem) {
		game.deselectGem();
		if (game.gem == null || gem.id !== game.gem.id) {
			gem.style.border = 'solid 3px #000';
			game.gem = gem;
		}
	},

	/**
	 * Deselects the game's selected gem
	 */
	deselectGem: function () {
		if (game.gem != null) {
			game.gem.style.border = '';
			game.gem = null;   
		}
	},

	/**
	 * Swaps two gems
	 * @param source	The first gem to swap
	 * @param dest	The second gem to swap with the first one
	 */
	swapGems: function(source, dest, check) {
		var sourceX = source.x(),
			sourceY = source.y(),
			destX = dest.x(),
			destY = dest.y();

		// We animate the gems to their new positions
		if (source.left() != dest.left() || source.top() != dest.top()) {
			var gems = get('.gem');
			for (var i = 0; i < gems.length; i++) {
				gems[i].removeEventListener('click', game.onGemClick, false);	// We add the mouse event listener
			};
			if (check === true) {
				source.addListener(MOVE_COMPLETE, game.checkStreak);// Once the animation is over, check for a streak around the gem
				dest.addListener(MOVE_COMPLETE, game.checkStreak);	// Once the animation is over, check for a streak around the gem
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
	 * Looks for the presence and removes a streak around an gem
	 * @param gem	The gem wich neighbours will be checked for a streak
	 */
	checkStreak: function(gem) {
		gem.removeListener(MOVE_COMPLETE, game.checkStreak);	// Once the animation is over, check for a streak around the gems
		var gems = get('.gem'),
			streak = [];

		// We look for an gem streak
		streak = game.getStreak(gem);

		if (streak.length > 0) {
			gem.inStreak = true;
			game.removeStreak(streak);
			setTimeout(function() {		// We continue after the streak disappeared
				var gemsGenerated = game.generateGems(streak);
				var newGems = gemsGenerated.newGems;
				streak = gemsGenerated.streak;
				game.gemsFall(newGems, streak);

				game.deselectGem();
			}, 500);
		}else if (game.gem != null && game.gem.id !== gem.id && !game.gem.inStreak) {	// If there is a selected gem, and it is not in a streak, we will have to reverse the swap
			game.swapGems(gem, game.gem, false);		// We re-swap the gems to their respective original positions
			game.deselectGem();
			
			for (var i = 0; i < gems.length; i++) {
				gems[i].addEventListener('click', game.onGemClick, false);	// We add the mouse event listener
			};
		}
	},

	/**
	 * Searches for the presence of an gem streak
	 * @param gem	The gem which column and row will be parsed
	 * @param streak	An array containing the gems that are in a streak
	 * @return The streak array with the streaked gems in it
	 */
	getStreak: function(gem) {
		var x = gem.x(),
			y = gem.y(),
			row = [],
			column = [],
			streak = [];

		row = game.checkRow(gem, true, true);
		column = game.checkColumn(gem, true, true);

		// If we have a row of three identical gems
		if (row.length > 1) {
			for (var i = 0; i < row.length; i++) {
				if (streak.indexOf(row[i]) == -1) {
					streak.push(row[i]);
					row[i].inStreak = true;
				}
			}
		}

		// If we have a column of three identical gems
		if (column.length > 1) {
			for (var i = 0; i < column.length; i++) {
				if (streak.indexOf(column[i]) == -1) {
					streak.push(column[i]);
					column[i].inStreak = true;
				}
			}
		}
 
		// If we have a row or a column of three identical gems
		if ((row.length > 1 || column.length > 1) && streak.indexOf(gem) == -1) {
			streak.push(gem);	// We know the moved gem will be removed
		}


		/*** Remove comment if we want additionnal streaks with rows and lines ***/
		// If we have a row or a column of three identical gems
		// if ((row.length > 1 || column.length > 1)) {
		// 	// Rows
		// 	for (var i = 0; i < row.length; i++) {
		// 		if (streak.indexOf(row[i]) == -1)
		// 			streak.push(row[i]);	// We will remove the gems from the row
		// 	}
			
		// 	// Columns
		// 	for (var i = 0; i < column.length; i++) {
		// 		if (streak.indexOf(column[i]) == -1)
		// 			streak.push(column[i]);	// We will remove the gems from the column
		// 	}

		// 	// The moved gem
		// 	if (streak.indexOf(gem) == -1)
		// 		streak.push(gem);	// We know the moved gem will be removed
		// }
		return streak;
	},

	/**
	 * Looks through an gem's neighbours in a given direction
	 * @param gem	The gem which column and row will be parsed
	 * @param vertical	bool	Check vertically or horizontally ?
	 * @param step	int	(-1 OR 1) Check on one direction or another (left/right, top/bottom)
	 * @return The streak array with the streaked gems in it
	 */
	parseNeighbours: function (gem, vertical, step) {
		var line = [],
			i = 0,
			x = gem.x(),
			y = gem.y(),
			siblingCompare,
			currentGem,
			value = gem.value();

		// We run through the gems in one direction. The step indicates if we go one way or another on the X or Y axis (the axis is defined by the 'vertical' parameter)
		for (i = ((vertical ? y : x) + step); (step == -1) ? (i > -1) : (i < 8); i += step) {
			if (vertical) {
				currentGem = get('#tile' + i + '_' + x);	// The current parsed gem
			}else {
				currentGem = get('#tile' + y + '_' + i);	// The current parsed gem
			}

			siblingCompare = game.siblingCompare(currentGem, line, value, true);	// We check if this sibling is identical
			if (siblingCompare != false) {				
				line = siblingCompare;
			}else {
				break;
			}
		}
		return line;
	},

	/**
	 * Checks for a streak in the gem's column
	 * @param gem	The gem which column will be parsed
	 * @return An array containing the identical adjacent gems in the column
	 */
	checkColumn: function(gem, top, bottom) {
		if (top !== true && bottom !== true) {
			return;
		}
		
		var column = [];	
		// Checking the gems on top (if the gem is at an extremity, don't check behind the border)
		if (top && gem.y() > 0) {
			column = column.concat(game.parseNeighbours(gem, true, -1));
		}

		// Checking the gems on bottom (if the gem is at an extremity, don't check behind the border)
		if (bottom && gem.y() < 7) {
			column = column.concat(game.parseNeighbours(gem, true, 1));
		}

		/*** Remove comment if we want additionnal streaks with rows and lines ***/
		// if (gem == game.gem || gem == game.hovered) {
		// 	if (gemsNb > 1)
		// 		return column;
		// 	return [];
		// }
		return column;
	},

	/**
	 * Checks for a streak in the gem's row
	 * @param gem	The gem which row will be parsed
	 * @return An array containing the identical adjacent gems in the row
	 */
	checkRow: function(gem, left, right) {
		if (left !== true && right !== true) {
			return;
		}

		var row = [];
		// Checking the gems on the left
		if (left && gem.x() > 0) {
			row = row.concat(game.parseNeighbours(gem, false, -1));
		}

		// Checking the gems on the right
		if (right && gem.x() < 7) {
			row = row.concat(game.parseNeighbours(gem, false, 1));
		}

		/*** Remove comment if we want additionnal streaks with rows and lines ***/
		// if (gem == game.gem || gem == game.hovered) {	// If this is the 'main' row check
		// 	if (gemsNb > 1)	// We only consider rows that have more than 1 gems in them
		// 		return row;
		// 	return [];
		// }
		return row;
	},

	/**
	 * Check if the adjacent gem of a given gem is identical (vertically or horizontally)
	 * @param gem	The gem which siblings will be parsed
	 * @param line	An array containing the siblings that we already know are in a streak
	 * @param value	The value (sprite) of the source gem
	 * @param vertical	Should we check vertically or horizontally ?
	 * @return An array containing the identical adjacent gems | false if the array is empty
	 */
	siblingCompare: function(gem, line, value, vertical) {
		// console.log('gem: ', gem);
		if (gem.value() == value && gem != game.gem)	{
			if (line.indexOf(gem) == -1 && !gem.falling)
				line.push(gem);	// We add it to the gems to remove
			
			/*** Remove comment if we want additionnal streaks with rows and lines ***/
			// var currentGemLine = vertical ? game.checkRow(gem) : game.checkColumn(gem);	// We check for its adjacent gems
			// for (var i = 0; i < currentGemLine.length; i++)
			// 	line.push(currentGemLine[i]);
			return line;
		}
		return false;	// We stop looking for a streak
	},

	/**
	 * Checks if there is a streak among the new generated gems
	 * @param gem	The gem which siblings will be parsed
	 */
	checkComboStreak: function(gem) {
		var streak = game.getStreak(gem, []);
		if (streak.length > 0) {
			game.removeStreak(streak);
			setTimeout(function() {	// We continue after the streak disappeared
				var gemsGenerated = game.generateGems(streak);
				var newGems = gemsGenerated.newGems;
				streak = gemsGenerated.streak;
				// console.log('newGems: ', newGems);
				game.gemsFall(newGems, streak);
			}, 500);
		}
	},

	/**
	 * Removes all the gems that form a streak (line or row, or both)
	 * @param streak	An array containing the gems that are in a streak
	 */
	removeStreak: function(streak) {
		for (var i = 0; i < streak.length; i++) {
			game.removeGem(streak[i]);
		};
	},

	/**
	 * Makes the remaining gems fall after a streak disappeared
	 * @param newGems	The gems that were generated after the streak
	 * @param streak	An array containing the gems that are in a streak
	 */	
	gemsFall: function(newGems, streak) {
		var columns = {			// The columns which contain gems that must fall
			indexes: {},
		};
		for (var i = 0, x, y; i < streak.length; i++) {
			x = streak[i].x();
			y = streak[i].y();

			if (!columns.indexes.hasOwnProperty(x)){
				columns.indexes[x] = 1;
				columns['yMin' + x] = 8;
				columns['yMax' + x] = 0;
			}else if (newGems.indexOf(streak[i]) == -1) {	// We only count the gems that were removed, not the new ones
				columns.indexes[x]++;
			}
			
			if (y < columns['yMin' + x])
				columns['yMin' + x] = y;
			if (y > columns['yMax' + x])
				columns['yMax' + x] = y;
		}

		for (var i = 0, yMin, yMax; i < Object.getLength(columns.indexes); i++) {
			var gem, top, keys = Object.getKeys(columns.indexes), nbGems = columns.indexes[keys[i]];
			yMin = columns['yMin' + keys[i]];
			yMax = columns['yMax' + keys[i]];

			for (var j = (yMax - nbGems); j >= yMin; j--) {	// We run through the gems
				gem = get('#tile' + j + '_' + keys[i]);
				if (gem != null) {
					top = gem.top();
					top = parseInt(top.substring(0, top.length - 2));
					top += 60 * nbGems + 5 * nbGems;
					top += 'px';

					gem.falling = true;
					gem.animate('top', gem.top(), top, 6);	// We move the gem to its new position
					console.log('gem: ', gem);
					gem.x(j + nbGems);
					gem.y(keys[i]);
				}
			}
		}
	},

	/**
	 * Triggers every time an gem's fall is complete
	 * Add the mouse event listeners to all the gems, once all the animations are done
	 * @param gem	The gem which fall is complete
	 */
	onFallComplete: function(gem) {
		gem.falling = false;
		var gems = get('.gem');
		
		for (var i = 0; i < gems.length; i++) {
			if (gems[i].animated)	// If at least one gem is still being animated
				return;
		};

		// If all the animations are finished, we allow the player to move gems again
		for (var i = 0; i < gems.length; i++) {
			game.checkComboStreak(gems[i]);	// And we check if there is a streak among his new neighbours
			gems[i].addEventListener('click', game.onGemClick, false);	// We add the mouse event listener
		};
	},

	/**
	 * Generates random gems above the grid after a streak disappeared
	 * @param streak	An array containing the gems that are in a streak
	 * @return An array of the new generated gems
	 */
	generateGems: function(streak) {
		var i, gem, y, tile, gemsNb = streak.length, columns = {}, newGems = [];

		for (i = 0; i < gemsNb; i++) {
			x = streak[i].x();
			if (!columns.hasOwnProperty('column' + x))
				columns['column' + x] = 1;	// We start to count
			else	// Otherwise
				columns['column' + x]++;	// We add this gem to the count

			y = 0 - columns['column' + x];	// And then we calculate the necessary shift on the Y axis
			tile = parseInt(Math.random() * game.level.range);

		// PROBLEM : Gems with the same ids are generated
			gem = new Gem(x, y, tile);
			gem.addEventListener('click', game.onGemClick, false);	// We add the mouse event listener
			grid.appendChild(gem);
			console.log('y: ', y);
			gem.x(x);
			gem.y(y);

			streak.push(gem);
			newGems.push(gem);
		};
		return {
			newGems: newGems,
			streak: streak
		};
	}
};

window.onload = game.init();