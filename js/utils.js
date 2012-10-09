/**
 * Some useful functions
 * @author Nayael
 */


/**
 * Returns a DOM object or an array of DOM objects, depending on the argument (id, class, or tag name)
 */
function el (id) {
	switch (id.substr(0, 1)) {
		case '#':
			return document.getElementById(id.substr(1));
			break;
		case '.':
			return getElementsByClassName(id.substr(1));
			break;
		default:
			return document.getElementsByTagName(id);
	}
}