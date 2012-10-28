/**
 * Creates an item from its coordinates and tile value
 */
function Item(x, y, value) {
	if (this == window)
		throw new Error('Item() is a constructor, you can only call it with the keyword "new"');

	var item, left, top;
	left = ((60 * x) + 5 * (x + 1)) + 'px';
	top = ((60 * y) + 5 * (y + 1)) +'px';
	item = document.createElement('span');

	item.className = 'item tile_' + value;
	if (y >= 0 && x >= 0)
		item.id = 'tile' + y + '_' + x;

	item.style.top = top;
	item.style.left = left;
	item.style.backgroundImage = 'url("./images/sprites/' + value + '.png")';
	item.style.backgroundRepeat = 'no-repeat';
	item.style.backgroundPosition = 'top center';
	item.style.border = 'solid 3px #000';
	
	item.animated = false;	// Is the element being animated ?

	addItemPropCapabilities(item);	// We add useful functions relative to item objects
	addEventsCapabilities(item);	// We add useful functions relative to events

	item.addListener(FALL_COMPLETE, game.onFallComplete);	// We add the fall listener
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