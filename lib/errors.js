/**
 * Created by fritz on 1/1/14.
 */
var errorList = {
	/* base system */
	'10001': 'System error',
	'10008': 'Parameter error',
	'10020': 'Invalid api',

	/* file uploading */
	'20005': 'Unsupported image type, only support jpg',
	'20006': 'Image size too large',
	'20007': 'No file input',

	/* records & entities */
	'20102': 'Not your own',
	'20506': 'Record already exists',
	'20603': 'Record not exists',
	'20604': 'Entity type not exists',
	'20605': 'Entity not exists',

	/* starships & followship */
	'20701': 'Type not allowed to star',
	'20801': 'Self not allowed to follow',

	/* users */
	'20003': 'User not found',
	'21300': 'Register fail',
	'21301': 'Auth fail',
	'21302': 'Login fail',
	'21310': 'Username should be ' + /^[a-z][a-z0-9_\-\.]{2,16}[a-z0-9]$/i,
	'21311': 'Password should be ' + /^\w{6,18}$/i,
	'21312': 'Email not legal',

	/* file system */
	'30000': 'File reading error',
	'30001': 'File writing error',
	'30002': 'File deleting error',
	'30003': 'File copying error',

	/* groups & activities */
	'40001': 'Not the member of the group',
	'40002': 'Already apply',
	'40012': 'Deadline for application',
	'40013': 'Activity ended',
	'40014': 'Activity canceled',
	'40015': 'Activity-status error',
	'40016': 'Application accepted, not allowed to cancel',
	'40017': 'User not the owner',
	'40018': 'Not found'
};

module.exports = function buildError(code) {
	var message = errorList[code],
		error = new Error(message);
	error.code = ~~code;
	return error;
};
