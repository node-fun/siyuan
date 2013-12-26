var _ = require('underscore'),
	execsql = require('execsql'),
	config = require('../config.default'),
	isTest = config.isTest,
	connConfig = config.db.connection,
	User = require('../models/user'),
	Users = User.Collection,
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
		users.add(User.randomForge());
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
