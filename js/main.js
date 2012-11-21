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
	},

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
			// 	source.addListener(GemEvent.MOVE_COMPLETE, game.checkStreak);// Once the animation is over, check for a streak around the gem
			// 	dest.addListener(GemEvent.MOVE_COMPLETE, game.checkStreak);	// Once the animation is over, check for a streak around the gem
			}

			if (source.left() != dest.left()) {
				source.animate('left', source.left(), dest.left(), 8, check);
				dest.animate('left', dest.left(), source.left(), 8, check);
			}

			if (source.top() != dest.top()) {
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
		// gem.removeListener(GemEvent.MOVE_COMPLETE, game.checkStreak);	// Once the animation is over, check for a streak around the gems
		var gems = get('.gem');
		var streak = gem.getStreak();	// We look for a streak from the gem

		// If an existing streak was given, we concatenate the two streaks
		if (game.streak != undefined) {
			for (var column in streak) {
				if (game.streak[column] == undefined) {
				    game.streak[column] = streak[column];
				}else {
					for (var i = 0; i < streak[column].length; i++) {
						game.streak[column].push(streak[column][i]);
					};
				}
			};
		}else {
			game.streak = streak;	// Otherwise, we create it
			if (game.gem != undefined) {	// And, if this function was called after the player swap two gems, we stop the function (it will be called again with the checkStreak from the second gem)
				return;
			}
		}
		
		if (Object.getLength(game.streak) > 0) {
			gem.inStreak = true;
			game.removeStreak(game.streak);
		}else if (game.gem != null && game.gem.id !== gem.id && !game.gem.inStreak) {	// If there is a selected gem, and it is not in a streak, we will have to reverse the swap
			game.swapGems(gem, game.gem, false);		// We re-swap the gems to their respective original positions
			game.deselectGem();
			
			for (var i = 0; i < gems.length; i++) {
				gems[i].addEventListener('click', game.onGemClick, false);	// We add the mouse event listener
			};
		}
	},

	/**
	 * Checks if there is a streak among the new generated gems
	 * @param gem	The gem which siblings will be parsed
	 */
	checkComboStreak: function(gem) {
		// var streak = game.getStreak(gem);
		// if (streak.length > 0) {
		// 	game.removeStreak(streak);
		// 	setTimeout(function() {	// We continue after the streak disappeared
		// 		var generatedGems = game.generateGems(streak);
		// 		var newGems = generatedGems.newGems;
		// 		streak = generatedGems.streak;
		// 		// console.log('newGems: ', newGems);
		// 		game.gemsFall(newGems, streak);
		// 	}, 500);
		// }
	},

	/**
	 * Removes all the gems that form a streak (line or row, or both)
	 * @param gemsToRemove	An array containing the gems that are in a streak
	 */
	removeStreak: function(gemsToRemove) {
		var fallAfter = true;
		for (var column in gemsToRemove) {
			for (var i = 0; i < gemsToRemove[column].length; i++) {
				gemsToRemove[column][i].destroy(gemsToRemove, fallAfter);
				fallAfter = false;
			};
		};
	},

	/**
	 * Triggers when a streak is destroyed: starts the generation of new gems
	 * @param streak	An array containing the gems that are in a streak
	 */
	onStreakRemoved: function(streak) {		// We continue after the streak disappeared
		var firstYToFall = 8,	// The Y of the first item that will fall
			newGems = null,
			currentGem = null,
			fallHeight = 0,
			fallStarted = false;

		// We run through the gem columns
		for (var column in streak) {
			firstYToFall = 8;
			for (var i = 0; i < streak[column].length; i++) {
				if (streak[column][i].y() < firstYToFall) {
					firstYToFall = streak[column][i].y();
				}
			};
			firstYToFall--;
			
			// We generate the new gems, only once
			if (newGems == null) {	    
				newGems = game.generateGems(streak);
			}

			fallHeight = 0;
			for (i = firstYToFall; i >= -8; i--) {	// We define the height of the fall
				if (get('#tile' + i + '_' + streak[column][0].x()) == null)
					break;
				if (i < 0)
					fallHeight++;
			};
			for (i = firstYToFall; i >= -fallHeight; i--) {	// We run through the column from the bottom gem to the top gem, and make them fall
				currentGem = get('#tile' + i + '_' + streak[column][0].x());
				currentGem.fall(fallHeight, (!fallStarted ? true : false));
				fallStarted = true;
			};
		};
		delete game.streak;
		game.deselectGem();
	},

	/**
	 * Generates random gems above the grid after a streak disappeared
	 * @param streak	An array containing the gems that are in a streak
	 * @return An array of the new generated gems
	 */
	generateGems: function(streak) {
		var i, gem, y, tile, columns = {}, newGems = [];

		for (var column in streak) {
			gemsNb = streak[column].length;
			for (i = 0; i < gemsNb; i++) {
				x = streak[column][i].x();
				if (columns['column' + x] == undefined){
					columns['column' + x] = 1;	// We start to count
				}else {	// Otherwise
					columns['column' + x]++;	// We add this gem to the count
				}

				y = 0 - columns['column' + x];	// And then we calculate the necessary shift on the Y axis
				while (get('#tile' + y + '_' + x) != null) {
					y--;
				}
				tile = parseInt(Math.random() * game.level.range);

				gem = new Gem(x, y, tile);
				gem.addEventListener('click', game.onGemClick, false);	// We add the mouse event listener
				grid.appendChild(gem);
				gem.x(x);
				gem.y(y);

				newGems.push(gem);
			};
		};
		return newGems;
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
			// game.checkStreak(gems[i]);
			// game.checkComboStreak(gems[i]);	// And we check if there is a streak among his new neighbours
		};
	}
};

window.onload = game.init();