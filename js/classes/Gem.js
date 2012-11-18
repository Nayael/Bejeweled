/**
 * Creates an gem from its coordinates and tile value
 */
function Gem(x, y, value) {
	if (this == window) {
		throw new Error('Gem() is a constructor, you can only call it with the keyword "new"');
	}

	var gem, left, top;
	left = ((60 * x) + 5 * (x + 1)) + 'px';
	top = ((60 * y) + 5 * (y + 1)) + 'px';
	gem = document.createElement('span');

	gem.className = 'gem';
	gem.val = value;
	if (y >= 0 && x >= 0) {
		gem.id = 'tile' + y + '_' + x;
	}
	gem.innerHTML = x + '_' + y;
	
	gem.style.top = top;
	gem.style.left = left;
	gem.style.backgroundImage = 'url("./images/sprites/' + value + '.png")';
	gem.style.backgroundRepeat = 'no-repeat';
	gem.style.backgroundPosition = 'top center';
		
	gem.animated = false;	// Is the element being animated ?
	gem.falling = false;	// Is the element falling ?
	gem.timer = null;
	gem.inStreak = false;

	addGemMethods(gem);	// We add useful functions relative to gem objects
	addEventCapabilities(gem);	// We add useful functions relative to events

	gem.addListener(FALL_COMPLETE, game.onFallComplete);
	return gem;
};

/**
 * Returns (and sets, if a value is passed as an argument) the gem's "left" CSS property in px
 */
HTMLSpanElement.prototype.left = function(value) {
	if (value != undefined) {
		if (typeof(value) == 'number' && parseInt(value) == value)	// If value is an integer
			this.style.left = value + 'px';
		else if (typeof(value) == 'string')	// If value is a string
			this.style.left = value;
		return value;
	}
		
	return this.style.left;
};


/**
 * Returns (and sets, if a value is passed as an argument) the gem's "top" CSS property in px
 */
HTMLSpanElement.prototype.top = function(value) {
	if (value != undefined) {
		if (typeof(value) == 'number' && parseInt(value) == value)	// If value is an integer
			this.style.top = value + 'px';
		else if (typeof(value) == 'string')	// If value is a string
			this.style.top = value;
		return value;
	}

	return this.style.top;
};

function addGemMethods (obj) {
	/**
	 * Returns (and sets, if a value is passed as an argument) the gem's x position on the map
	 */
	obj.x = function(value) {
		if (value != undefined)	{
			this.id = (this.id != '') ? (this.id.substr(0, this.id.length - 1) + value) : 'tile0_' + value;
			this.innerHTML = this.id.substr(4);	
		}
		if (this.id != '')
			return parseInt(this.id.substr(this.id.length - 1));
		return null;
	};

	/**
	 * Returns (and sets, if a value is passed as an argument) the gem's y position on the map
	 */
	obj.y = function(value) {
		if (value != undefined){
			this.id = (this.id != '') ? (this.id.substring(0, 4) + value + this.id.substr(this.id.indexOf('_'))) : 'tile' + value + '_0';
			this.innerHTML = this.id.substr(4);	
		}
		if (this.id != '')
			return parseInt(this.id.substring(4, this.id.indexOf('_')));
		return null;
	};

	/**
	 * Returns (and sets, if a value is passed as an argument) the gem's y tile value
	 */
	obj.value = function(val) {
		if (val != undefined)
			// this.className = 'gem tile_' + val;
			this.val = val;
		if (this.className != '')
			// return parseInt(this.className.substr(10));
			return this.val;
		return null;
	};

	/**
	 * Animates an element's CSS property from start value to end value (only values in pixels)
	 */
	obj.animate = function(property, start, end, speed) {
		if (start == end)
			return;
		
		this.style[property] = start;
		if (start.indexOf('px') != -1)
			start = parseInt(start.substr(0, start.length - 2));
		if (end.indexOf('px') != -1)
			end = parseInt(end.substr(0, end.length - 2));

		var doAnimation = function(start, end, direction, speed) {
			for (var i = 0; i < speed; i++) {	
				// If the property has reached the end value
				if ((direction == 1 && start >= end) || (direction == -1 && start <= end)) {
					clearInterval(obj.timer);	// We stop the animation timer
					obj.dispatch(MOVE_COMPLETE, obj);
					obj.animated = false;
					if (property === 'top' && obj.falling) {
						obj.dispatch(FALL_COMPLETE, obj);
					}
					return;
				}
				start += direction;
				obj.style[property] = start + 'px';
			}
			return start;
		};

		var direction = (end - start > 0) ? 1 : -1;
		// We start the gem's timer
		obj.timer = setInterval(function() {
			start = doAnimation(start, end, direction, speed);
		}, 30);
		obj.animated = true;
	};

	/**
	 * Animates the explosion of an gem and removes it
	 */
	obj.explode = function() {
		var i = 0, timer;
		var animateExplosion = function () {
			if (i >= 5) {
				clearInterval(timer);
				if (obj.parentNode) {
					obj.parentNode.removeChild(obj);
					// obj.removeListener(MOVE_COMPLETE, game.checkStreak);
				}
				return;
			}
			obj.style.backgroundImage = 'url("./images/sprites/' + obj.value() + '_explosion' + (i%2) + '.png")';
			i++;	
		};

		timer = setInterval(function() {
			animateExplosion();
		}, 100);
	};

	/**
	 * Checks if a given gem is adjacent to the object
	 * @param gem	The gem to compare with the current object
	 */
	obj.isAdjacent = function(gem) {
		return (((obj.x() === gem.x() - 1 || obj.x() === gem.x() + 1) && obj.y() === gem.y())
			 || ((obj.y() === gem.y() - 1 || obj.y() === gem.y() + 1) && obj.x() === gem.x()));
	};
};