/**
 * Initializes the level timer
 */
Game.initTimer = function() {
	Game.timer = {			// The timer is initialized at 1 minutes
		minutes: 1,
		seconds: 0,
		real: (1 * 60 * 1000)
	};
	get('#current_gauge').style.height = '100%';
};
Game.resetTimer = Game.initTimer;

/**
 * Updates the level timer
 */
Game.updateTimer = function() {
	Game.timer.real -= 50;

	// Every second
	if (Game.timer.real % 1000 == 0) {
		Game.timer.seconds -= 1;
		get("#current_gauge").style.height = (Game.timer.real * 100 / (1 * 60 * 1000)) + '%';
	}
};