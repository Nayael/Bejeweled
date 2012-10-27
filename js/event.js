var FALL_COMPLETE = 'fall_complete';

function addEventsCapabilities(object) {
	object.listenersFor = {};   // A list of all the listeners on a given event
	
	object.addListener = function(eventName, callback) {
		if (!this.listenersFor[eventName])
			this.listenersFor[eventName] = [];
		this.listenersFor[eventName].push(callback);    // We the callback to the list of listeners on this event
	};
	
	object.dispatch = function () {
		var args = Array.prototype.slice.call(arguments),	// We transforms the 'arguments' parameter to an array
			eventName = args.shift(),						// We get the emitted event's name
			listeners = this.listenersFor[eventName];		// We get all the listener on this event

		for (var i = 0; i < listeners.length; i++) {
			try {
				listeners[i].apply(this, args);	// We call all the listeners one by one
			}catch(e) {
				console.warn('Error on event ' + eventName);
				throw(e); 
			}
		}
	};
}