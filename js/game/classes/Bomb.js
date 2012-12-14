/**
 * A bonus item for Ore : the Bomb
 */
Game.Bomb = function(explode) {
	if (this == window) {
		throw new Error('Bomb() is a constructor, you can only call it with the keyword "new"');
	}
	var bomb = document.createElement('span');
	bomb.className = 'bomb';
	bomb.addEventListener('click', explode, false);
	bomb.active = false;
	return bomb;
};