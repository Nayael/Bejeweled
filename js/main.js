// This variable represents the instance of the game
var game = {
	lvlIndex: 0,		// The current level index
	level: levels[0],	// The current level object
	gem: null,			// The selected gem

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
			};
		};
		// var gems = get('.gem');
		// for (var i = 0; i < gems.length; i++) {
		// 	game.checkStreak(gems[i]);
		// };
	},

	mainLoop: setInterval(function() {
		var gems = get('.gem'), addClick = true;
		for (var i = 0; i < gems.length; i++) {
			if (gems[i].timer != undefined) {
			    addClick = false;
			}
		};
		if (addClick) {
			for (var i = 0; i < gems.length; i++) {
				gems[i].removeEventListener('click', game.onGemClick, false);	// We add the mouse event listener
				gems[i].addEventListener('click', game.onGemClick, false);	// We add the mouse event listener
			};
		}
	}, 60),

	/**
	 * Triggers when an gem is clicked (select it or proceed to the swap)
	 * @param e	The mouse event
	 */
	onGemClick: function(e) {
		var target = e.srcElement || e.target;
		if (game.gem == null) {
			game.selectGem(target);
		}else {
			if (target.isNeighbour(game.gem)) {		// If the clicked gem is adjacent to the first selected gem
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
	selectGem: function(gem) {
		game.deselectGem();
		if (game.gem == null || gem.id !== game.gem.id) {
			gem.style.border = 'solid 3px #000';
			game.gem = gem;
		}
	},

	/**
	 * Deselects the game's selected gem
	 */
	deselectGem: function() {
		if (game.gem != null) {
			game.gem.style.border = '';
			game.gem = null;   
		}
	},

	/**
	 * Swaps two gems
	 * @param source	The first gem to swap
	 * @param dest	The second gem to swap with the first one
	 * @param check	bool: Shall we look for a streak with the swapped gems ?
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
				gems[i].removeEventListener('click', game.onGemClick, false);	// We remove the mouse event listeners
			};

			if (check === true) {
			// 	source.addListener(Gem.Event.MOVE_COMPLETE, game.checkStreak);// Once the animation is over, check for a streak around the gem
			// 	dest.addListener(Gem.Event.MOVE_COMPLETE, game.checkStreak);	// Once the animation is over, check for a streak around the gem
			}

			if (source.left() != dest.left()) {
				source.animate('left', source.left(), dest.left(), 8, check);
				dest.animate('left', dest.left(), source.left(), 8, check);
			}else if (source.top() != dest.top()) {
				source.animate('top', source.top(), dest.top(), 8, check);	
				dest.animate('top', dest.top(), source.top(), 8, check);
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
	 * @param gem	The gem which neighbours will be checked for a streak
	 */
	checkStreak: function(gem) {
		// gem.removeListener(Gem.Event.MOVE_COMPLETE, game.checkStreak);	// Once the animation is over, check for a streak around the gems
		var gems = get('.gem');
		var streak = gem.getStreak();	// We look for a streak from the gem
		for (var i = 0; i < gems.length; i++) {
			gems[i].removeEventListener('click', game.onGemClick, false);	// We remove the mouse event listeners
		};

		if (Object.getLength(streak) > 0) {
			gem.inStreak = true;
			game.removeStreak(streak);
		}else if (game.gem != null && game.gem.id !== gem.id && !game.gem.inStreak) {	// If there is a selected gem, and it is not in a streak, we will have to reverse the swap
			game.swapGems(gem, game.gem, false);		// We re-swap the gems to their respective original positions
			game.deselectGem();
			
			for (var i = 0; i < gems.length; i++) {
				gems[i].addEventListener('click', game.onGemClick, false);	// We add the mouse event listener
			};
		}
	},

	/**
	 * Removes all the gems that form a streak (line or row, or both)
	 * @param gemsToRemove	An array containing the gems that are in a streak
	 */
	removeStreak: function(gemsToRemove) {
		var totalGems = 0, nbGems = 0, fallAfter = false;

		for (var column in gemsToRemove) {
			for (var i = 0; i < gemsToRemove[column].length; i++) {
				totalGems++;
			};
		};

		for (var column in gemsToRemove) {
			for (var i = 0; i < gemsToRemove[column].length; i++) {
				nbGems++;
				if (nbGems == totalGems) {
					fallAfter = true;	// We make the gems fall after the last one was destroyed
				}
				gemsToRemove[column][i].destroy(gemsToRemove, fallAfter);
			};
		};
	},

	/**
	 * Triggers when a streak is destroyed: starts the generation of new gems
	 * @param streak	An array containing the gems that are in a streak
	 */
	onStreakRemoved: function(streak) {		// We continue after the streak disappeared
		var firstYToFall = game.level.map.length,	// The Y of the first item that will fall
			newGems = null,
			currentGem = null,
			fallHeight = 0,
			fallStarted = false,
			skip = false;

		// We run through the gem columns
		for (var column in streak) {
			for (var i = game.level.map.length - 1; i >= 0; i--) {
				currentGem = get('#tile' + i + '_' + column);
				if (currentGem != null && currentGem.timer != undefined) {	// If there is an item from another streak that is still animated, we pass this column
					skip = true;
					break;
				}
			};
			if (skip) {
				skip = false;
				continue;
			}

			firstYToFall = game.level.map.length;
			for (i = game.level.map.length - 1; i >= 0; i--) {	// We run through the column from bottom to top
				currentGem = get('#tile' + i + '_' + column);
				if (currentGem == null) {				// Once we found a gem that was destroyed
					for (var j = i - 1; j >= 0; j--) {	// We run through the gems on top of it
						currentGem = get('#tile' + j + '_' + column);
						if (currentGem != null) {		// Once we found a valid gem on top of the destroyed gems
							firstYToFall = j;			// It is the first that will fall on this column
							break;
						}
					};
					break;
				}
			};
			if (firstYToFall >= 7) {	// If there is no "hole" in the grid
			    firstYToFall = -1;		// It means there is a hole from the top, the first gem to fall is on top the grid
			}
			game.generateGems(column);	// We generate the new gems
			get('#tile' + firstYToFall + '_' + column).fallStreak();	// We make the first gem fall (the others will follow)
		};
		game.deselectGem();
	},

	/**
	 * Generates random gems above the grid after a streak disappeared
	 * @param streak	An array containing the gems that are in a streak
	 * @return An array of the new generated gems
	 */
	generateGems: function(x) {
		var quantity = 0, y, value;

		for (var i = game.level.map.length - 1; i >= 0; i--) {
			currentGem = get('#tile' + i + '_' + x);
			if (currentGem == null) {
				quantity++;

				value = parseInt(Math.random() * game.level.range);
				y = -1 * quantity;
				gem = new Gem(parseInt(x), y, value);
				grid.appendChild(gem);
			}
		};
	},

	/**
	 * Triggers every time a gem streak's fall is complete
	 * Adds the mouse event listeners to all the gems, once all the animations are done
	 */
	onFallComplete: function() {
		var gems = get('.gem');

		// If all the animations are finished, we allow the player to move gems again
		for (var i = 0; i < gems.length; i++) {
			gems[i].addEventListener('click', game.onGemClick, false);	// We add the mouse event listener
		};
	}
};

window.onload = game.init();