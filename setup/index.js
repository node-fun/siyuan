var _ = require('underscore'),
	execsql = require('execsql'),
	config = require('../config'),
	isTest = config.isTest,
	connConfig = config.db.connection,
	Users = require('../models/users'),
	User = Users.prototype.model,
	numUsers = 200,
	users = Users.forge(),
	sqlFile = __dirname + '/db' + (isTest ? '_test' : '') + '.sql';

// create databases
execsql.config(connConfig).exec(sqlFile, function(err, results){
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
		users.add(User.createRandom());
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
