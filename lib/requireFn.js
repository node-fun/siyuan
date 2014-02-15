/**
 * Created by fritz on 2/15/14.
 */
var path = require('path');

/**
 * easy way for circular module loading
 */
function requireFn(name) {
	return function () {
		var modulePath = path.dirname(module.parent.id);
		return require(path.resolve(modulePath, name));
	};
}

module.exports = requireFn;
