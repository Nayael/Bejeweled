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

Array.max = function(array) {
    return Math.max.apply(Math, array);
}

Array.min = function(array) {
    return Math.min.apply(Math, array);
}