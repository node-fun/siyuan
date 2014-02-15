/**
 * Created by fritz on 2/15/14.
 */

/**
 *
 */
function requireFn(name) {
	return function () {
		return require(name);
	}
}

module.exports = requireFn;
