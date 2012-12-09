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
 * Returns the length of an object (associative array)
 */
Object.getLength = function(obj) {
	var length = 0;
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			length++;
		}
	}
	return length;
};