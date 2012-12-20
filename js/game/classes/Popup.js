/**
 * Displays a custom popup
 * @param {object}	args:
 * args = {
 *     type: 'text' || 'html',
 *     content: 'string'
 *     buttons: [{
 *         text: 'string',
 *         callback: function
 *     }],
 *     background: CSS
 *     style: {
 *     	    CSS
 *     }
 * }
 */
function Popup (args) {
	if (args.type == undefined)
		throw new Error('Missing property "type" in argument object');
	if (args.content == undefined)
		throw new Error('Missing property "content" in argument object');

	var that = this;
	this.container = document.createElement('div');
	this.container.className = 'popup';
	this.container.style.position = 'absolute';
	this.container.style.width = '100%';
	this.container.style.height = '100%';
	this.container.style.top = 0;
	this.container.style.left = 0;
	this.container.style.zIndex = '1000';
	this.container.style.textAlign = 'center';
	this.container.style.backgroundColor = args.background || 'rgba(255,255,255,0.4)';

	var box = document.createElement('div');
	box.style.position = 'absolute';
	box.style.border = '1px solid #666';
	box.style.background = '#FFFFFF';
	box.style.width = '400px';
	box.style.height = '150px';
	box.style.boxShadow = '2px 2px 5px #333';
	box.style.margin = 'auto';
	box.style.paddingTop = '5px';
	box.style.top = '50%';
	box.style.left = '50%';
	var width = parseInt(box.style.width.substring(0, box.style.width.length - 2)),
		height = parseInt(box.style.height.substring(0, box.style.height.length - 2));
	box.style.margin = '-' + (height / 2) + 'px 0 0 -' + (width / 2) + 'px';

	if (args.style != undefined) {
		box.style = args.style;
		box.style.border = args.style.border || box.style.border;
		box.style.background = args.style.background || box.style.background;
		box.style.width = args.style.width || box.style.width;
		box.style.height = args.style.height || box.style.height;
		box.style.margin = args.style.margin || box.style.margin;
		box.style.paddingTop = args.style.paddingTop || box.style.paddingTop;
		box.style.top = args.style.top || box.style.top;
		box.style.left = args.style.left || box.style.left;
	}


	if (args.type === 'text') {
		var p = document.createElement('p');
		p.innerText = args.content;
		box.appendChild(p);
	}else if (args.type === 'html') {
		box.innerHTML = args.content;
	}else {
		throw new Error('Error: "type" property in argument object should be string ("text" or "html"), ' + args.type + ':' + typeof args.type + ' given instead.');
	}
	for (var i = 0, button, btContainer, currentBt; i < args.buttons.length; i++) {
		currentBt = args.buttons[i];
		button = document.createElement('button');
		button.innerHTML = args.buttons[i].text;
		button.style.padding = '4px 12px 4px 12px';
		button.style.fontSize = '14px';
		button.style.fontWeight = 'bold';
		button.style.color = '#555';

		if (typeof currentBt.callback === 'function') {
			button.onclick = function () {
				that.remove();
				currentBt.callback();
			}
		}else if (currentBt.callback === 'remove') {
			button.onclick = function () {
				that.remove();
			};
		}

		btContainer = document.createElement('p');
		btContainer.appendChild(button);
		box.appendChild(btContainer);
	};

	this.container.appendChild(box);
}

Popup.prototype.show = function() {
	document.body.appendChild(this.container);
};

Popup.prototype.remove = function() {
	document.body.removeChild(this.container);
};

Popup.alert = function(text, callback) {
	var popup = new Popup({
		type: 'html',
		content: '<h3>' + text + '</h3><br/>',
		buttons: [
			{
				text: 'Ok',
				callback: callback || 'remove'
			}
		]
	});
	popup.show();
};

Popup.confirm = function(text) {
	var popup = new Popup({
		type: 'text',
		content: text,
		buttons: [
			{
				text: 'OK',
				callback: 'remove'
			}
		]
	});
	popup.show();
	return true;
};

Popup.prompt = function(text) {
	var popup = new Popup({
		type: 'text',
		content: text,
		buttons: [
			{
				text: 'OK',
				callback: 'remove'
			}
		]
	});
	popup.show();
	var value;

	return value;
};