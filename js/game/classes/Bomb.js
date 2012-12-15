/**
 * A bonus item for Ore : the Bomb
 */
Game.Bomb = function() {
	if (this == window) {
		throw new Error('Bomb() is a constructor, you can only call it with the keyword "new"');
	}
	var bomb = document.createElement('span');
	addBombCapabilities(bomb);

	bomb.className = 'bomb item';
	bomb.addEventListener('click', bomb.explode, false);
	bomb.active = false;

	return bomb;
};

function addBombCapabilities(bomb) {
	addItemCapabilities(bomb);
	/**
	 * Makes the bomb, and the surrounding gems explode
	 */
	bomb.explode = function(event) {
		if (!bomb.active)
			return;

		var gemsToRemove = [], x = bomb.x(), y = bomb.y();
		for (var i = (x > 0 ? x - 1 : x); i <= (x < 7 ? x + 1 : x); i++) {
			gemsToRemove[i] = [];
			for (var j = (y > 0 ? y - 1 : y); j <= (y < 7 ? y + 1 : y); j++) {
				if (i == x && j == y)
					continue;
				gemsToRemove[i].push(get('#tile' + j + '_' + i));
			};
		};
		get('#grid').removeChild(bomb);
		Game.removeStreak(gemsToRemove);
		Game.playSound('bomb.wav');
		delete Game.bonus.bomb;
	};
};