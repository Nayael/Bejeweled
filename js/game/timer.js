/**
 * Initializes the level timer
 */
Game.initTimer = function() {
	Game.timer = {			// The timer is initialized at 1 minutes
		minutes: 3,
		seconds: 0,
		real: (3 * 60 * 1000)
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
		get("#current_gauge").style.height = (Game.timer.real * 100 / (3 * 60 * 1000)) + '%';
	}

	if (Game.timer.real <= 0) {
		Game.timesUp();
	}
};

/**
 * The player loses if the timer is finished
 */
Game.timesUp = function() {
	Popup.confirm('Temps écoulé !<br/>Voulez-vous recommencer ?', null, Game.restart);
}