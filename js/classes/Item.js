/**
 * Creates an item from its coordinates and tile value
 */
function Item(x, y, value) {
	if (this == window)
		throw new Error('Item() is a constructor, you can only call it with the keyword "new"');

	var item, left, top;
	left = ((60 * x) + 5 * (x + 1)) + 'px';
	top = ((60 * y) + 5 * (y + 1)) + 'px';
	item = document.createElement('span');

	item.className = 'item tile_' + value;
	if (y >= 0 && x >= 0)
		item.id = 'tile' + y + '_' + x;

	item.style.top = top;
	item.style.left = left;
	item.style.backgroundImage = 'url("./images/sprites/' + value + '.png")';
	item.style.backgroundRepeat = 'no-repeat';
	item.style.backgroundPosition = 'top center';
	// item.style.border = 'solid 3px #000';
	
	item.animated = false;	// Is the element being animated ?
	item.falling = false;	// Is the element falling ?
	item.timer = null;
	item.inStreak = false;

	addItemCapabilities(item);		// We add useful functions relative to item objects
	addEventCapabilities(item);	// We add useful functions relative to events

	item.addListener(FALL_COMPLETE, game.onFallComplete);
	return item;
};

/**
 * Returns (and sets, if a value is passed as an argument) the item's "left" CSS property in px
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
 * Returns (and sets, if a value is passed as an argument) the item's "top" CSS property in px
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

function addItemCapabilities (obj) {
	/**
	 * Returns (and sets, if a value is passed as an argument) the item's x position on the map
	 */
	obj.x = function(value) {
		if (value != undefined)	
			this.id = (this.id != '') ? (this.id.substr(0, this.id.length - 1) + value) : 'tile0_' + value;
		if (this.id != '')
			return parseInt(this.id.substr(this.id.length - 1));
		return null;
	};

	/**
	 * Returns (and sets, if a value is passed as an argument) the item's y position on the map
	 */
	obj.y = function(value) {
		if (value != undefined)
			this.id = (this.id != '') ? (this.id.substring(0, 4) + value + this.id.substr(this.id.indexOf('_'))) : 'tile' + value + '_0';
		if (this.id != '')
			return parseInt(this.id.substring(4, this.id.indexOf('_')));
		return null;
	};

	/**
	 * Returns (and sets, if a value is passed as an argument) the item's y tile value
	 */
	obj.value = function(val) {
		if (val != undefined)
			this.className = 'item tile_' + val;
		if (this.className != '')
			return parseInt(this.className.substr(10));
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
		obj.timer = setInterval(function() {
			start = doAnimation(start, end, direction, speed);
		}, 30);
		obj.animated = true;
	};

	/**
	 * Animates the explosion of an item and removes it
	 */
	obj.explode = function() {
		var i = 0, timer;
		var animateExplosion = function () {
			if (i >= 5) {
				clearInterval(timer);
				if (obj.parentNode)
					obj.parentNode.removeChild(obj);
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
	 * Checks if a given item is adjacent to the object
	 * @param item	The item to compare with the current object
	 */
	obj.isAdjacent = function(item) {
		return (((obj.x() === item.x() - 1 || obj.x() === item.x() + 1) && obj.y() === item.y())
			 || ((obj.y() === item.y() - 1 || obj.y() === item.y() + 1) && obj.x() === item.x()));
	};
};