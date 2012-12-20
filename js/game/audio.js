// Audio related functions

/**
 * Plays a sound in the game
 */
Game.playSound = function(file) {
	var sound = document.createElement('audio');
	sound.setAttribute('src', './audio/' + file);
	sound.play();
};