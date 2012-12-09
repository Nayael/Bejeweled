// This variable represents the instance of the game
var game = {};

game.levelIndex = 0;	// The current level index
game.level = levels[0];	// The current level object
game.gridSize = 8;
game.gem = null;		// The selected gem
game.totalScore = 0;
game.levelScore = 0;
game.finalScore = 15000;

/**
 * Creates the game's grid of gems
 */
game.init = function () {
	var grid = get('#grid'), map = [], row, vGems = [], hGems = [];

	for (var i = 0, j = 0; i < game.gridSize; i++) {
		row = [];
		map.push(row);	// We create a row in the map

		for (j = 0; j < game.gridSize; j++) {
			do {
				gem = new Gem(j, i, parseInt(Math.random() * game.level.range));
				if (i > 0)
					vGems = gem.parseNeighbours(true, -1);
				if (j > 0)
					hGems = gem.parseNeighbours(false, -1);
			}while (vGems.length >= 2 || hGems.length >= 2);

			gem.addEventListener('click', game.onGemClick, false);	// We add the mouse event listener
			gem.pop(grid);
			vGems = [];
			hGems = [];
		};
	};

	get('#restart_bt').onclick = game.restart;
};

/**
 * The game main loop
 */
game.mainLoop = setInterval(function() {
	var gems = get('.gem'), addClick = true;
	for (var i = 0; i < gems.length; i++) {
		if (gems[i].timer != undefined) {	// If at least one gem is being animated
		    addClick = false;	// We prevent the player from clicking on the gems
		}
	};
	if (addClick) {
		for (var i = 0; i < gems.length; i++) {
			gems[i].removeEventListener('click', game.onGemClick, false);	// We remove all the previous listeners, just in case
			gems[i].addEventListener('click', game.onGemClick, false);
		};
	}
}, 60);

/**
 * Triggers when an gem is clicked (select it or proceed to the swap)
 * @param {event} e	The mouse event
 */
game.onGemClick = function(e) {
	var target = e.srcElement || e.target;
	if (game.gem == null) {
		game.selectGem(target);
	}else {
		if (target.isNeighbour(game.gem)) {			// If the clicked gem is adjacent to the first selected gem
			game.swapGems(game.gem, target, true);	// We can swap them
		}else {							// Otherwise
			game.selectGem(target);		// We select the new one
		}
	}
};

/**
 * Makes a given gem the game's selected gem
 * @param {Gem} gem	The gem to select
 */
game.selectGem = function(gem) {
	game.deselectGem();
	if (game.gem == null || gem.id !== game.gem.id) {
		gem.style.border = 'solid 3px #000';
		game.gem = gem;
	}
};

/**
 * Deselects the game's selected gem
 */
game.deselectGem = function() {
	if (game.gem != null) {
		game.gem.style.border = '';
		game.gem = null;   
	}
};

/**
 * Swaps two gems
 * @param {Gem} source	The first gem to swap
 * @param {Gem} dest	The second gem to swap with the first one
 * @param {bool} check	Shall we look for a streak with the swapped gems ?
 */
game.swapGems = function(source, dest, check) {
	var sourceX = source.x(),
		sourceY = source.y(),
		destX = dest.x(),
		destY = dest.y();

	// We animate the gems to their new positions
	if (source.left() != dest.left() || source.top() != dest.top()) {
		var gems = get('.gem');
		for (var i = 0; i < gems.length; i++) {
			gems[i].removeEventListener('click', game.onGemClick, false);	// We prevent the player from clicking on the gems
		};

		if (source.left() != dest.left()) {
			source.animate('left', source.left(), dest.left(), 9, check);
			dest.animate('left', dest.left(), source.left(), 9, check);
		}else if (source.top() != dest.top()) {
			source.animate('top', source.top(), dest.top(), 9, check);	
			dest.animate('top', dest.top(), source.top(), 9, check);
		}
		
		// We swap the x and y properties
		source.x(destX);
		source.y(destY);
		dest.x(sourceX);
		dest.y(sourceY);
	}
};

// TODO combo streak : si après la chute, plus de 3 streak --> problème de détection de streak
/**
 * Looks for the presence and removes a streak around an gem
 * @param {Gem} gem	The gem which neighbours will be checked for a streak
 */
game.checkStreak = function(gem) {
	var gems = get('.gem');
	var streak = gem.getStreak();	// We look for a streak from the gem
	for (var i = 0; i < gems.length; i++) {
		gems[i].removeEventListener('click', game.onGemClick, false);	// We remove the mouse event listeners
	};

	if (game.levelScore >= game.finalScore) {
		game.nextLevel();
		return;
	}
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
};

/**
 * Removes all the gems that form a streak (column or row, or both)
 * @param {Array} gemsToRemove	An array containing the gems that are in a streak
 */
game.removeStreak = function(gemsToRemove) {
	var totalGems = 0, nbGems = 0, fallAfter = false, scoreBonus = 0, gaugeSize = 0;

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
	scoreBonus += totalGems*100;	// Every destroyed gems equals 100 points
	
	// For a streak bigger than 3, the player gets a bonus	
	if (totalGems > 3) {
		for (var i = 0; i < totalGems - 3; i++) {
			scoreBonus += 100 * (i+1);
		};
	}
	game.levelScore += scoreBonus;
	game.totalScore += scoreBonus;
	
	// We update the UI
	gaugeSize = (game.levelScore/game.finalScore * 100);
	if (game.levelScore >= game.finalScore) {
		gaugeSize = 100;
	}
	get('#player_score').innerHTML = game.totalScore;
	get('#current_gauge').style.height = gaugeSize + '%';
};

/**
 * Triggers when a streak is destroyed: starts the generation of new gems
 * @param {Array} streak	An array containing the gems that are in a streak
 */
game.onStreakRemoved = function(streak) {		// We continue after the streak disappeared
	var firstYToFall = game.gridSize,	// The Y of the first item that will fall
		newGems = null,
		currentGem = null,
		fallHeight = 0,
		fallStarted = false,
		skip = false;

	// We run through the gem columns
	for (var column in streak) {
		for (var i = game.gridSize - 1; i >= 0; i--) {
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

		firstYToFall = game.gridSize;
		for (i = game.gridSize - 1; i >= 0; i--) {	// We run through the column from bottom to top
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
};

/**
 * Generates random gems above the grid after a streak disappeared
 * @param {Array} streak	An array containing the gems that are in a streak
 * @return {Array} An array of the new generated gems
 */
game.generateGems = function(x) {
	var quantity = 0, y, value;

	for (var i = game.gridSize - 1; i >= 0; i--) {
		currentGem = get('#tile' + i + '_' + x);
		if (currentGem == null) {
			quantity++;

			value = parseInt(Math.random() * game.level.range);
			y = -1 * quantity;
			gem = new Gem(parseInt(x), y, value);
			grid.appendChild(gem);
		}
	};
};

/**
 * Removes all the gems from the grid
 */
game.emptyGrid = function() {
	var gems = get('.gem'), grid = get('#grid');
	for (var i = 0; i < gems.length; i++) {
		grid.removeChild(gems[i]);
	};
}

/**
 * Restarts the game
 */
game.restart = function() {
	game.emptyGrid();
	game.levelScore = 0;
	game.totalScore = 0;
	game.finalScore = 15000;
	game.levelIndex = 0;
	get('#game_level').innerHTML = 1;
	get('#player_score').innerHTML = 0;
	game.level = levels[0];
	game.init();
};

/**
 * Goes to the next level
 */
game.nextLevel = function() {
	var gems = get('.gem');
	alert('Niveau ' + (game.levelIndex + 1) + ' terminé !');
	game.levelIndex++;
	game.level = levels[game.levelIndex];
	get('#current_gauge').style.height = '0%';
	get('#game_level').innerHTML = (game.levelIndex + 1);
	game.levelScore = 0;
	game.finalScore *= 1.5;
	game.emptyGrid();
	game.init();
};

window.onload = game.init();