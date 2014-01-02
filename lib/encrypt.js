/**
 * Created by fritz on 1/2/14.
 */
var crypto = require('crypto');

module.exports = function (str) {
	return md5(str);
}

function md5(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}
