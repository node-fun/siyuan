/**
 * Created by fritz on 2/15/14.
 */
var Module = require('module'),
	path = require('path');

/**
 * easy way for circular module loading
 */
function requireFn(request) {
	return function () {
		var parent = module.parent,
			name = Module._resolveFilename(request, parent);
		return require(name);
	};
}

module.exports = requireFn;
