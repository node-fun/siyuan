var cp = require('child_process'),
	assert = require('assert'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	config = require('../config'),
	isTest = config.isTest,
	rootDir = config.rootDir,
	Users = require('../models/users'),
	User = Users.model,
	numUsers = 200,
	users = Users.forge(),
	sqlFile = __dirname + '/db' + (isTest ? '_test' : '') + '.sql';

// create databases
var cmd = 'node ' + rootDir + '/lib/execsql' + ' ' + sqlFile;
cp.exec(cmd, function (err) {
	if (err) {
		throw err;
	}
	console.log('database has been setup');
	if (isTest) {
		addRecords();
	} else {
		process.exit();
	}
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
