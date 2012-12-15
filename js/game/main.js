/**
 * The game main loop
 */
Game.mainLoop = setInterval(function() {
	var gems = get('.gem');
	for (var i = 0; i < gems.length; i++) {
		if (gems[i].timer != undefined) {	// If at least one gem is being animated
			Game.moving = true;	// The gems are moving, we prevent the player from clicking on the gems
			return;
		}
	};

	// If all the animations are over
	if (Game.moving) {
		Game.moving = false;
		Game.onMoveComplete(gems);
	}
}, 50);

/**
 * Triggers when all the animations of a movement are done
 */
Game.onMoveComplete = function(gems) {
	for (var i = 0; i < gems.length; i++) {
		gems[i].removeEventListener('click', Game.onGemClick, false);	// We remove all the previous listeners, just in case
		gems[i].addEventListener('click', Game.onGemClick, false);
	};

	// We activate the bombs' click
	if (get('.bomb') != undefined) {
		var bombs = get('.bomb');
		if (bombs.length == undefined) {
			bombs = [bombs];
		}
		
		for (var i = 0; i < bombs.length; i++) {
			bombs[i].active = true;
		};
	}

	if (Game.combo != undefined) {
		delete Game.combo;
	}

	// If the goal has been reached, we go to the next level
	if (Game.score.current >= Game.score.goal) {
		Game.nextLevel();
		return;
	}

	// We check if the game is over (and get a hint for the player at the same time)
	Game.checkGameOver();
};

/**
 * Triggers when an gem is clicked (select it or proceed to the swap)
 * @param {event} e	The mouse event
 */
Game.onGemClick = function(e) {
	var target = e.srcElement || e.target;
	// If a hint is displayed, we remove it
	if (Game.hint.displayed === true) {
		Game.removeHint();
	}

	if (Game.gem == null) {
		Game.selectGem(target);
	}else {
		if (target.isNeighbour(Game.gem)) {			// If the clicked gem is adjacent to the first selected gem
			Game.swapGems(Game.gem, target, true);	// We can swap them
		}else {							// Otherwise
			Game.selectGem(target);		// We select the new one
		}
	}
};

/**
 * Makes a given gem the game's selected gem
 * @param {Gem} gem	The gem to select
 */
Game.selectGem = function(gem) {
	Game.deselectGem();
	if (Game.gem == null || gem.id !== Game.gem.id) {
		gem.style.backgroundImage += ', url("./images/sprites/gemSelected.gif")';
		Game.gem = gem;
	}
};

/**
 * Deselects the game's selected gem
 */
Game.deselectGem = function() {
	if (Game.gem != null) {
		Game.gem.style.backgroundImage = 'url("./images/sprites/' + Game.gem.value() + '.png")';
		Game.gem = null;   
	}
};

/**
 * Swaps two gems
 * @param {Gem} source	The first gem to swap
 * @param {Gem} dest	The second gem to swap with the first one
 * @param {bool} check	Shall we look for a streak with the swapped gems ?
 */
Game.swapGems = function(source, dest, check) {
	var sourceX = source.x(),
		sourceY = source.y(),
		destX = dest.x(),
		destY = dest.y();

	// We animate the gems to their new positions
	if (source.left() != dest.left() || source.top() != dest.top()) {
		var gems = get('.gem');
		for (var i = 0; i < gems.length; i++) {
			gems[i].removeEventListener('click', Game.onGemClick, false);	// We prevent the player from clicking on the gems
		};

		if (source.left() != dest.left()) {
			source.animate('left', source.left(), dest.left(), 9, check ? Game.checkStreak : null);
			dest.animate('left', dest.left(), source.left(), 9, check ? Game.checkStreak : null);
		}else if (source.top() != dest.top()) {
			source.animate('top', source.top(), dest.top(), 9, check ? Game.checkStreak : null);	
			dest.animate('top', dest.top(), source.top(), 9, check ? Game.checkStreak : null);
		}
		
		// We swap the x and y properties
		source.x(destX);
		source.y(destY);
		dest.x(sourceX);
		dest.y(sourceY);
	}
};

/**
 * Looks for the presence and removes a streak around an gem
 * @param {Gem} gem	The gem which neighbours will be checked for a streak
 */
Game.checkStreak = function(gem) {
	var gems = get('.gem'),
		streak = gem.getStreak();	// We look for a streak from the gem

	for (var i = 0; i < gems.length; i++) {
		gems[i].removeEventListener('click', Game.onGemClick, false);	// We remove the mouse event listeners
	};

	if (Object.getLength(streak) > 0) {
		// We calculate the number of combos
		if (Game.gem == null) {
			Game.combo = (Game.combo == undefined ? 1 : Game.combo + 1);
		}
		gem.inStreak = true;
		Game.removeStreak(streak);
	}else if (Game.gem != null && Game.gem.id !== gem.id && !Game.gem.inStreak) {	// If there is a selected gem, and it is not in a streak, we will have to reverse the swap
		Game.swapGems(gem, Game.gem, false);		// We re-swap the gems to their respective original positions
		Game.deselectGem();
		
		for (var i = 0; i < gems.length; i++) {
			gems[i].addEventListener('click', Game.onGemClick, false);	// We add the mouse event listener
		};
	}
};

/**
 * Removes all the gems that form a streak (column or row, or both)
 * @param {Array} gemsToRemove	An array containing the gems that are in a streak
 */
Game.removeStreak = function(gemsToRemove) {
	var file = 'misc1.wav';

	// If there is more than 1 combo streak
	if (Game.combo != undefined && Game.combo > 1) {
		file = 'spring.wav';
			Game.winBomb();
		if (Game.combo == 2 && Game.bonus.bomb == undefined) {	// The player earns a bonus
		}
	}
	// We play a sound for the gem destruction
	// Game.playSound(file);

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
	
	Game.updateScore(totalGems);
};

/**
 * Triggers when a streak is destroyed: starts the generation of new gems
 * @param {Array} streak	An array containing the gems that are in a streak
 */
Game.onStreakRemoved = function(streak) {		// We continue after the streak disappeared
	var firstYToFall = Game.GRID_SIZE,	// The Y of the first item that will fall
		newGems = null,
		currentGem = null,
		fallHeight = 0,
		fallStarted = false,
		skip = false;

	// We run through the gem columns
	for (var column in streak) {
		for (var i = Game.GRID_SIZE - 1; i >= 0; i--) {
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

		firstYToFall = Game.GRID_SIZE;
		for (i = Game.GRID_SIZE - 1; i >= 0; i--) {	// We run through the column from bottom to top
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
		Game.generateGems(column);	// We generate the new gems
		get('#tile' + firstYToFall + '_' + column).fallStreak();	// We make the first gem fall (the others will follow)
	};
	Game.deselectGem();
};

/**
 * Generates random gems above the grid after a streak disappeared
 * @param {Array} streak	An array containing the gems that are in a streak
 * @return {Array} An array of the new generated gems
 */
Game.generateGems = function(x) {
	var quantity = 0, y, value;
	for (var i = Game.GRID_SIZE - 1; i >= 0; i--) {
		currentGem = get('#tile' + i + '_' + x);
		if (currentGem == null) {
			quantity++;

			value = parseInt(Math.random() * Game.gemRange);
			y = -1 * quantity;
			gem = new Game.Gem(parseInt(x), y, value);
			grid.appendChild(gem);
		}
	};
};

/**
 * Updates the player's score after a match
 * @param {Number}	destroyedGems	The number of gems that were destroyed
 */
Game.updateScore = function(destroyedGems) {
	var perGem = 100 + (Game.combo == undefined ? 0 : (50 * Game.combo)),
		gain = destroyedGems * perGem,
		gaugeSize = 0,
		gainSpan = document.createElement('span'),
		yOrigin = 160,
		yShift = 5;
	
	// For a streak bigger than 3, the player gets a bonus	
	if (destroyedGems > 3) {
		for (var i = 0; i < destroyedGems - 3; i++) {
			gain += 100 * (i+1);
		};
	}

	Game.score.current += gain;
	Game.score.total += gain;
	
	// If there is already a gain displayed, we sum the gains
	var existingGain = get('.score_gain');
	if (existingGain != null) {
		if (existingGain.length == undefined) {
			existingGain = [existingGain];
		}
		for (var i = 0; i < existingGain.length; i++) {
			gain += parseInt(existingGain[i].innerHTML.substr(1));
			get('#player_info').removeChild(existingGain[i]);
		};
	}

	// We update the UI
	gainSpan.className  ='score_gain';
	gainSpan.innerHTML = '+' + gain;
	gainSpan.style.top = yOrigin + 'px';
	get('#player_info').insertBefore(gainSpan, get('#total_score'));

	// The gain animation
	var gainMove = setInterval(function() {
		var y = parseInt(gainSpan.style.top.substring(0, gainSpan.style.top.indexOf('px')));
		if (y >= yOrigin + 35) {
			clearInterval(gainMove);
			if (gainSpan.parentNode) {
				get('#player_info').removeChild(gainSpan);
			}
			return;
		}
		gainSpan.style.top = (y+yShift) + 'px';
	}, 60);

	gaugeSize = (Game.score.current/Game.score.goal * 100);
	if (Game.score.current >= Game.score.goal) {
		gaugeSize = 100;
	}
	get('#total_score').innerHTML = Game.score.total;
	get('#current_gauge').style.height = gaugeSize + '%';
};

/**
 * Removes all the items from the grid
 */
Game.emptyGrid = function() {
	var items = get('.item'), grid = get('#grid');
	for (var i = 0; i < items.length; i++) {
		grid.removeChild(items[i]);
	};
}

/**
 * Restarts the game
 */
Game.restart = function() {
	Game.emptyGrid();
	Game.init();
};

/**
 * Displays a coinfirm popup to restart the game
 */
Game.confirmRestart = function() {
	if (confirm('Êtes-vous sûr(e) de vouloir recommencer ?')){
		Game.restart();
	}
	// var popup = new Popup('Voulez-vous recommencer le jeu ?', [
	// 	{
	// 		text: 'Oui',
	// 		callback: Game.restart
	// 	},{
	// 		text: 'Non'
	// 	}, '300px', '200px'
	// ]);
};

/**
 * Goes to the next level
 */
Game.nextLevel = function() {
	alert('Niveau ' + Game.level + ' terminé !');
	Game.level++;
	Game.score.current = 0;
	Game.score.goal *= 1.5;

	get('#current_gauge').style.height = '0%';
	get('#level').innerHTML = Game.level;
	Game.emptyGrid();
	Game.createGrid();
};

/**
 * Checks if the game is over (no possibility to make a streak)
 */
Game.checkGameOver = function() {
	if (!Game.checkHint()) {
		Game.gameOver();
	}
};

/**
 * When the game is over : displays a popup to make the player restart
 */
Game.gameOver = function() {
	if (confirm('Il n\'y a plus de mouvements possibles.\nVoulez-vous recommencer ?')){
		Game.restart();
	}
};

window.onload = Game.init();