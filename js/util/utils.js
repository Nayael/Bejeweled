/**
 * Some useful functions
 * by Nayael
 */


/**
 * Returns a DOM object or an array of DOM objects, depending on the argument (id, class, or tag name)
 */
function get(id) {
	switch (id.substr(0, 1)) {
		case '#':
			return document.getElementById(id.substr(1));
			break;
		case '.':
			return document.getElementsByClassName(id.substr(1));
			break;
		default:
			return document.getElementsByTagName(id);
	}
}