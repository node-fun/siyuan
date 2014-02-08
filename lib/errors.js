/**
 * Created by fritz on 1/1/14.
 */
var _ = require('underscore'),
	errorList;

errorList = [
	[10001, 'System error'],
	[10008, 'Parameter error'],
	[10020, 'Invalid api'],

	[20003, 'User not found'],
	[20005, 'Unsupported image type, only support jpg'],
	[20006, 'Image size too large'],
	[20007, 'No file input'],

	[20102, 'Not your own'],
	[20506, 'Record already exists'],
	[20603, 'Record not exists'],
	[20604, 'Resource type not exists'],
	[20605, 'Resource not exists'],

	[21300, 'Register fail'],
	[21301, 'Auth fail'],
	[21302, 'Login fail'],
	[21310, 'Password should be /^[a-zA-Z]\\w{5,17}$/'],

	[30000, 'File reading error'],
	[30001, 'File writing error'],
	[30002, 'File deleting error'],
	[30003, 'File copying error'],

	[40001, 'Not the member of the group'],
	[40002, 'Already apply'],
	[40012, 'Deadline for application'],
	[40013, 'Activity ended'],
	[40014, 'Activity canceled'],
	[40015, 'Activity-status error'],
	[40016, 'Application accepted, not allowed to cancel'],
	[40017, 'User not the owner'],
	[40018, 'Not found']
];

module.exports = _.reduce(errorList, function (errors, item) {
	var code = item[0], message = item[1];
	errors[code] = buildError(code, message);
	return errors;
}, {});

function buildError(code, message) {
	var err = new Error(message);
	err.code = ~~code;
	return err;
}
