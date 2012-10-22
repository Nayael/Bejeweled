/**
 * Some useful functions
 * by Nayael
 */


/**
 * Returns a DOM object or an array of DOM objects, depending on the argument (id, class, or tag name)
 */
function get(id) {
	// switch (id.substr(0, 1)) {
	// 	case '#':
	// 		return document.getElementById(id.substr(1));
	// 		break;
	// 	case '.':
	// 		return document.getElementsByClassName(id.substr(1));
	// 		break;
	// 	default:
	// 		return document.getElementsByTagName(id);
	// }
	var elem = document.querySelectorAll(id);
	if (elem.length < 2)
		return document.querySelector(id);
	return elem;
}

/**
 * Removes an element from the page
 */
function remove (elem) {
	elem.parentNode.removeChild(elem);
}

/**
 * Adds an event listener (handles IE compatibility)
 */
function addEvent(element, event, func) {
	if (element.attachEvent)
		element.attachEvent('on' + event, func);
	else
		element.addEventListener(event, func, true);
}

/**
 * Removes an event listener (handles IE compatibility)
 */
function removeEvent(element, event, func) {
	if (element.detachEvent)
		element.detachEvent('on' + event, func);
	else
		element.removeEventListener(event, func, true);
}

/**
 * Animates an element's CSS property from start value to end value (only values in pixels)
 */
function animate (elem, property, start, end, speed) {
	if (start == end)
		return;
	
	elem.style[property] = start;
	if (start.indexOf('px') != -1)
		start = parseInt(start.substr(0, start.length - 2));
	if (end.indexOf('px') != -1)
		end = parseInt(end.substr(0, end.length - 2));

	var doAnimation = function(elem, start, end, direction, speed) {
		// If the property has reached the end value
		for (var i = 0; i < speed; i++) {	
			if ((direction == 1 && start >= end) || (direction == -1 && start <= end)) {
				clearInterval(timer);
				return;
			}
			start += direction;
			elem.style[property] = start + 'px';
		}
		return start;
	};

	var direction = (end - start > 0) ? 1 : -1,
		timer = setInterval(function(){
			start = doAnimation(elem, start, end, direction, speed);
		}, 30);
	return timer;
}

/**
 * Returns the length of an object (associative array)
 */
Object.getLength = function(obj) {
	var getLength = 0, key;
	for (key in obj) {	
		if (obj.hasOwnProperty(key))
			getLength++;
	}
	return getLength;
};

/**
 * Returns all the keys of an object (associative array) in an array
 */
Object.getKeys = function(obj) {
	var keys = [];
	for(var key in obj)
		keys.push(key);
	return keys;
};