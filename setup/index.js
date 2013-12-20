var cp = require('child_process'),
	assert = require('assert'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	config = require('../config'),
	rootDir = config.rootDir,
	Users = require('../models/users'),
	User = Users.model,
	numUsers = 200,
	users = Users.forge();

// reset database
var cmd = 'node ' + rootDir + '/lib/execsql' + ' ' + __dirname + '/db.sql';
cp.exec(cmd, function (err) {
	if (err) {
		throw err;
	}
	addRecords();
});

function addRecords() {
	// add a set of random users
	var user;
	_.times(numUsers, function (i) {
		users.add(User.createRandomUser());
	});

	// save into database
	users.invokeThen('save').then(function () {
		if (!_.every(users.model, function (m) {
			return m.id;
		})) {
			return console.log('failed');
		}
		console.log('%d records inserted', numUsers);
		process.exit();
	});
}
