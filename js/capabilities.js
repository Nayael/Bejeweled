function addItemPropCapabilities (obj) {
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
					clearInterval(obj.timer);
					obj.animated = false;
					if (property === 'top' && obj.falling) {
						obj.dispatch(FALL_COMPLETE, obj);
					}
					obj.falling = false;
					return;
				}
				start += direction;
				obj.style[property] = start + 'px';
			}
			return start;
		};

		var direction = (end - start > 0) ? 1 : -1;
		obj.timer = setInterval(function(){
				start = doAnimation(start, end, direction, speed);
			}, 30);
		obj.animated = true;
	};

	obj.explode = function(argument) {
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
};