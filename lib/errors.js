/**
 * Created by fritz on 1/1/14.
 */
var _ = require('underscore'),
	errorList;

errorList = [
	[10008, 'Parameter error'],
	[10020, 'Invalid api'],

	[20003, 'User not found'],
	[20005, 'Unsupported image type, only support jpg'],
	[20006, 'Image size too large'],
	[20007, 'No file input'],

	[20102, 'Not your own'],
	[20506, 'Already exists'],
	[20522, 'Not your friend'],
	[20603, 'Target not found'],

	[21300, 'Register fail'],
	[21301, 'Auth fail'],
	[21302, 'Login fail'],

	[30000, 'File reading error'],
	[30001, 'File writing error'],

	[40001, 'Not the member of the group'],
	[40002, 'Already apply'],
	[40012, 'Deadline for application'],
	[40013, 'Activity ended'],
	[40014, 'Activity canceled'],
	[40015, 'Activity-status error'],
	[40016, 'Application accepted, not allowed to cancel'],
	[40017, 'User not the owner']
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
