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
		return elem[0] || document.querySelector(id);
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