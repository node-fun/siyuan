/**
 * Created by fritz on 1/1/14.
 */
var _ = require('underscore'),
	errorList;

errorList = [
	[10020, 'invalid api'],
	[20003, 'user not found'],
	[21300, 'register fail'],
	[21301, 'auth fail'],
	[21302, 'login fail']
];

module.exports = _.reduce(errorList, function(errors, item){
	var code = item[0], message = item[1];
	errors[code] = buildError(code, message);
	return errors;
}, {});

function buildError(code, message) {
	var err = new Error(message);
	err.code = ~~code;
	return err;
}
