/**
 * Creates an item from its coordinates and tile value
 */
function Item(y, x, tile) {
	if (this == window)
		throw new Error('Item() is a constructor, you can only call it with the keyword "new"');

	var item, left, top;
	left = ((60 * x) + 5 * (x + 1)) + 'px';
	top = ((60 * y) + 5 * (y + 1)) +'px';
	item = document.createElement('span');
	item.className = 'item tile_' + tile;
	if (y >= 0 && x >= 0)
		item.id = 'tile' + y + '_' + x;
	item.style.top = top;
	item.style.left = left;
	item.style.backgroundImage = 'url("../images/sprites/' + tile + '.png")';
	item.style.backgroundRepeat = 'no-repeat';
	item.style.backgroundPosition = 'top center';
	item.style.border = 'solid 3px #000';
	return item;
};

/**
 * Returns (and sets, if a value is passed as an argument) the item's x position on the map
 */
HTMLSpanElement.prototype.x = function(value) {
	if (value != undefined)	
		this.id = (this.id != '') ? (this.id.substr(0, this.id.length - 1) + value) : 'tile0_' + value;
	if (this.id != '')
		return parseInt(this.id.substr(this.id.length - 1));
	return null;
};

/**
 * Returns (and sets, if a value is passed as an argument) the item's y position on the map
 */
HTMLSpanElement.prototype.y = function(value) {
	if (value != undefined)
		this.id = (this.id != '') ? (this.id.substring(0, 4) + value + this.id.substr(5)) : 'tile' + value + '_0';
	if (this.id != '')
		return parseInt(this.id.substring(4, this.id.indexOf('_')));
	return null;
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