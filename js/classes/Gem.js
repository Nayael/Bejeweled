/**
 * Creates an gem from its coordinates and tile value
 */
function Gem(x, y, value) {
	if (this == window) {
		throw new Error('Gem() is a constructor, you can only call it with the keyword "new"');
	}
	var left = ((60 * x) + (5 * (x + 1))) + 'px',
		top = ((60 * y) + (5 * (y + 1))) + 'px',
		gem = document.createElement('span');

	gem.className = 'gem';
	gem.val = value;
	gem.id = 'tile' + y + '_' + x;
	gem.innerHTML = y + '_' + x;
	
	gem.style.top = top;
	gem.style.left = left;
	gem.style.backgroundImage = 'url("./images/sprites/' + value + '.png")';
	gem.style.backgroundRepeat = 'no-repeat';
	gem.style.backgroundPosition = 'top center';
	
	gem.falling = false;	// Is the element falling ?
	gem.inStreak = false;

	addGemMethods(gem);	// We add useful functions relative to gem objects
	addEventCapabilities(gem);	// We add useful functions relative to events

	return gem;
};

Gem.TILE_HEIGHT = 65;
Gem.Event = {
	FALL_COMPLETE: 'fall_complete',
	MOVE_COMPLETE: 'move_complete',
	DESTROYED: 'destroyed'
};

function addGemMethods (gem) {
	/**
	 * Returns (and sets, if a value is passed as an argument) the gem's "left" CSS property in px
	 */
	gem.left = function(value) {
		if (value != undefined) {
			if (typeof(value) == 'number' && parseInt(value) == value)	// If value is an integer
				gem.style.left = value + 'px';
			else if (typeof(value) == 'string')	// If value is a string
				gem.style.left = value;
			return value;
		}
			
		return gem.style.left;
	};


	/**
	 * Returns (and sets, if a value is passed as an argument) the gem's "top" CSS property in px
	 */
	gem.top = function(value) {
		if (value != undefined) {
			if (typeof(value) == 'number' && parseInt(value) == value)	// If value is an integer
				gem.style.top = value + 'px';
			else if (typeof(value) == 'string')	// If value is a string
				gem.style.top = value;
			return value;
		}

		return gem.style.top;
	};

	/**
	 * Returns (and sets, if a value is passed as an argument) the gem's x position on the map
	 */
	gem.x = function(value) {
		if (value != undefined)	{
			gem.id = (gem.id != '') ? (gem.id.substr(0, gem.id.length - 1) + value) : 'tile0_' + value;
			gem.innerHTML = gem.id.substr(4);	
		}
		if (gem.id != '')
			return parseInt(gem.id.substr(gem.id.length - 1));
		return null;
	};

	/**
	 * Returns (and sets, if a value is passed as an argument) the gem's y position on the map
	 */
	gem.y = function(value) {
		if (value != undefined) {
			gem.id = (gem.id != '') ? (gem.id.substring(0, 4) + value + gem.id.substr(gem.id.indexOf('_'))) : 'tile' + value + '_0';
			gem.innerHTML = gem.id.substr(4);	
		}
		if (gem.id != '')
			return parseInt(gem.id.substring(4, gem.id.indexOf('_')));
		return null;
	};

	/**
	 * Returns (and sets, if a value is passed as an argument) the gem's y tile value
	 */
	gem.value = function(val) {
		if (val != undefined)
			gem.val = val;
		if (gem.className != '')
			return gem.val;
		return null;
	};

	/**
	 * Compares a gem's value with this gem's value
	 */
	gem.equals = function(neighbour) {
		if (neighbour != null && neighbour.value() == gem.value() && neighbour != gem && !neighbour.falling)	{
			return true;
		}
		return false;
	};

	/**
	 * Checks if a given gem is adjacent to the object
	 * @param target	The gem to compare with the current object
	 */
	gem.isNeighbour = function(target) {
		return (((gem.x() === target.x() - 1 || gem.x() === target.x() + 1) && gem.y() === target.y())
			 || ((gem.y() === target.y() - 1 || gem.y() === target.y() + 1) && gem.x() === target.x()));
	};

	/**
	 * Searches for the presence of an gem streak
	 * @return The streak array with the streaked gems in it
	 */
	gem.getStreak = function() {
		var x = gem.x(),
			y = gem.y(),
			row = [],
			column = [],
			streak = {};

		row = gem.checkRow(true, true);
		column = gem.checkColumn(true, true);

		// If we have a row of three identical gems
		if (row.length > 1) {
			for (var i = 0; i < row.length; i++) {
				streak[row[i].x()] = [];
				if (streak[row[i].x()].indexOf(row[i]) == -1) {
					streak[row[i].x()].push(row[i]);
					row[i].inStreak = true;
				}
			};
		}

		// If we have a column of three identical gems
		if (column.length > 1) {
			for (var i = 0; i < column.length; i++) {
				if (streak[column[i].x()] == undefined) {
					streak[column[i].x()] = [];
				}
				if (streak[column[i].x()].indexOf(column[i]) == -1) {
					streak[column[i].x()].push(column[i]);
					column[i].inStreak = true;
				}
			};
		}
		// If we have a row or a column of three identical gems
		if ((row.length > 1 || column.length > 1) && (streak[gem.x()] == undefined || streak[gem.x()].indexOf(gem) == -1)) {
			if (streak[gem.x()] == undefined) {
				streak[gem.x()] = [];
			}
			streak[gem.x()].push(gem);	// We know the moved gem will be removed
			gem.inStreak = true;
		}
		return streak;
	};

	/**
	 * Looks through an gem's neighbours in a given direction
	 * @param vertical	bool	Check vertically or horizontally ?
	 * @param step	int	(-1 OR 1) Check on one direction or another (left/right, top/bottom)
	 * @return The streak array with the streaked gems in it
	 */
	gem.parseNeighbours = function(vertical, step) {
		var streak = [],
			i = 0,
			x = gem.x(),
			y = gem.y(),
			currentGem;

		// We run through the gems in one direction. The step indicates if we go one way or another on the X or Y axis (the axis is defined by the 'vertical' parameter)
		for (i = ((vertical ? y : x) + step); (step == -1) ? (i > -1) : (i < 8); i += step) {
			if (vertical) {
				currentGem = get('#tile' + i + '_' + x);	// The current parsed gem
			}else {
				currentGem = get('#tile' + y + '_' + i);	// The current parsed gem
			}

			// If the current gem is equal to the source gem, we add it to the streak
			if (streak.indexOf(currentGem) == -1 && gem.equals(currentGem) && currentGem.inStreak == false) {
				streak = streak.concat(currentGem);
			}else {
				break;
			}
		};
		return streak;
	};



	/**
	 * Checks for a streak in the gem's column
	 * @return An array containing the identical adjacent gems in the column
	 */
	gem.checkColumn = function(top, bottom) {
		if (top !== true && bottom !== true) {
			return;
		}
		
		var column = [];	
		// Checking the gems on top (if the gem is at an extremity, don't check behind the border)
		if (top && gem.y() > 0) {
			column = column.concat(gem.parseNeighbours(true, -1));
		}
		// Checking the gems on bottom (if the gem is at an extremity, don't check behind the border)
		if (bottom && gem.y() < 7) {
			column = column.concat(gem.parseNeighbours(true, 1));
		}
		return column;
	};

	/**
	 * Checks for a streak in the gem's row
	 * @return An array containing the identical adjacent gems in the row
	 */
	gem.checkRow = function(left, right) {
		if (left !== true && right !== true) {
			return;
		}

		var row = [];
		// Checking the gems on the left
		if (left && gem.x() > 0) {
			row = row.concat(gem.parseNeighbours(false, -1));
		}
		// Checking the gems on the right
		if (right && gem.x() < 7) {
			row = row.concat(gem.parseNeighbours(false, 1));
		}
		return row;
	};

	/**
	 * Animates an element's CSS property from start value to end value (only values in pixels)
	 */
	gem.animate = function(property, start, end, speed, check) {
		if (start == end)
			return;
		
		this.style[property] = start;
		start = parseInt(start.substr(0, start.length - 2));
		end = parseInt(end.substr(0, end.length - 2));

		var doAnimation = function(start) {
			for (var i = 0; i < speed; i++) {
				// If the property has reached the end value
				if ((direction == 1 && start >= end) || (direction == -1 && start <= end)) {
					clearInterval(gem.timer);	// We stop the animation timer
					delete gem.timer;

					if (check === true && !gem.falling) {
						game.checkStreak(gem);
					}
					if (gem.falling) {
						gem.onFallComplete();
					}
					return;
				}
				start += direction;
				gem.style[property] = start + 'px';
			};
			return start;
		};

		var delta = end - start,
			direction = (delta > 0) ? 1 : -1;

		// We start the gem's timer
		gem.timer = setInterval(function() {
			start = doAnimation(start);
		}, 30);
	};

	/**
	 * Makes the gem fall vertically
	 */
	gem.fallStreak = function () {
		var x = gem.x(),
			y = gem.y(),
			currentGem = null;

		// We make all the gems on the column fall by 1 slot
		gem.fall();
		for (var i = y; i >= -(game.level.map.length - 1); i--) {
			currentGem = get('#tile' + i + '_' + x);
			if (currentGem != null) {
				currentGem.fall();
			}
		};
	};

	/**
	 * Makes the gem fall by one slot
	 */
	gem.fall = function () {
		var top = gem.top(),
			height = parseInt(top.substring(0, top.length - 2));
		
		height += Gem.TILE_HEIGHT;
		gem.falling = true;
		gem.y(parseInt(gem.y() + 1));	// We set the new Y position after the fall
		gem.animate('top', top, height + 'px', 6);
	};

	/**
	 * Trggiers everytime the gem's fall is finished
	 */
	gem.onFallComplete = function() {
		var gems = get('.gem');
		gem.falling = false;

		if (get('#tile' + (gem.y() + 1) + '_' + gem.x()) == null && (gem.y() + 1) != 8) {	// If there is still an empty slot below the gem
			gem.fall();		// We make it fall again
		}else {				// Otherwise, the fall is over
			game.checkStreak(gem);	// We look for a streak
		}
	};

	/**
	 * Animates the explosion of an gem and removes it
	 * @param streak	An array containing the gems that are in a streak
	 * @param fallAfter	bool: Should the gms fall after this gem's explosion ? (true for the first destroyed gem)
	 */
	gem.destroy = function(streak, fallAfter) {
		var i = 0, loops = 5, timer;

		function animateExplosion () {
			if (i >= loops) {
				clearInterval(gem.timer);
				delete gem.timer;
				if (gem.parentNode) {
					gem.parentNode.removeChild(gem);
				}
				if (fallAfter === true) {
					game.onStreakRemoved(streak);
				}
				return;
			}

			gem.style.backgroundImage = 'url("./images/sprites/' + gem.value() + '_explosion' + (i % 2) + '.png")';
			i++;	
		};

		gem.timer = setInterval(function() {
			animateExplosion();
		}, 500 / loops);
	};
};