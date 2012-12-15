/**
 * Checks if the player still has a possibility to make a streak
 * @return {Array} An array containing the gems to swap if it is possible, null otherwise
 */
Game.checkHint = function() {
	var gems = get('.gem'),
		hint = null;

	for (var i = gems.length - 1; i >= 0; i--) {
		// If there is at least one gem can be moved to make a streak
		if ((hint = gems[i].getPossibleMove()) != null) {
			break;
		}
	};

	if (Game.hint != undefined && !Array.equals(Game.hint.gems, hint)) {
		clearTimeout(Game.hint.timer);
	}
	// We set the hint (only if it differs from the previous)
	if (hint != null && (Game.hint == undefined || !Array.equals(Game.hint.gems, hint))) {
		Game.hint = {
			gems: hint,		// We keep the hint for the player
			timer: setTimeout(Game.showHint, 15000)	// We will show it in 15 seconds if the player is stuck
		};
	}
	return (hint != null);
};

/**
 * Displays an animation to give the player a hint on which gem to move if he is stuck
 */
Game.showHint = function() {
	if (Game.hint == undefined)
	    return;
	var arrow = document.createElement('span'),
		gems = Game.hint.gems,
		left, top, width, height,
		timer1, timer2;

	// We make sure to put the first gem from the top, or the left as the first element of the array
	if (gems[0].x() == gems[1].x() && gems[0].y() > gems[1].y() || gems[0].x() > gems[1].x()) {
		gems.reverse();
	}
	
	left = parseInt(gems[0].left().substr(0, gems[0].left().length - 2)) - 2.5;
	top = parseInt(gems[0].top().substr(0, gems[0].top().length - 2)) - 2.5;

	// We place the arrow at the middle of the gems to swap
	if (gems[0].x() == gems[1].x()) {	// If the gems are in the same column.
		width = 19;
		height = 65;
		arrow.style.backgroundImage = 'url("./images/sprites/v_arrow.png")';
		arrow.style.left = (left + Game.TILE_SIZE / 2 - (width / 2)) + 'px';
		arrow.style.top = (top + Game.TILE_SIZE / 2 - (height - Game.TILE_SIZE) / 2) + 'px';
	}else {
		width = 65;
		height = 19;
		arrow.style.backgroundImage = 'url("./images/sprites/h_arrow.png")';
		arrow.style.left = (left + Game.TILE_SIZE / 2 - (width - Game.TILE_SIZE) / 2) + 'px';
		arrow.style.top = (top + Game.TILE_SIZE / 2 - height / 2) + 'px';
	}
	arrow.id = 'hint_arrow';
	arrow.style.position = 'absolute';
	arrow.style.width = width + 'px';
	arrow.style.height = height + 'px';


	// We make the arrow blink
	timer1 = setInterval(function() {
		var blinks = 3, i = 0;	// The arrow blinks 3 times
		timer2 = setInterval(function() {
			Game.hint.displayed = true;
			if (i == blinks * 2) {
				clearInterval(timer2);
				return;
			}
			// Once every two, we display and remove the arrow
			if (i % 2 == 0) {
				grid.appendChild(arrow);
			}else {
				if (arrow.parentNode) {
					grid.removeChild(arrow);
				}
			}
			i++;
		}, 200);
	}, 2000);

	/**
	 * Removes the hint animation once the player has clicked on a gem
	 */
	Game.removeHint = function() {
		// We stop the blinking
		clearInterval(timer2);
		clearInterval(timer1);
		clearTimeout(Game.hint.timer);
		if (arrow.parentNode) {
			grid.removeChild(arrow);	// We remove the arrow if it is displayed
		}
		Game.hint.timer = setTimeout(Game.showHint, 15000);	// We restart the timer to re-display it in 15 seconds
		delete Game.hint.displayed;
	};
};
