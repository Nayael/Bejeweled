/**
 * Returns a DOM object or an array of DOM objects, depending on the argument (id, class, or tag name)
 */
function get(id) {
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