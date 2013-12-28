var _ = require('underscore'),
	execsql = require('execsql'),
	config = require('../config'),
	isTest = config.isTest,
	connConfig = config.db.connection,
	User = require('../models/user'),
	Users = User.Collection,
	numUsers = 200,
	sqlFile = __dirname + '/db.sql';

// create database for test
execsql.config(connConfig)
	.exec('use ' + connConfig.database + ';', function (err) {
		if (err) throw err;
		execsql.execFile(sqlFile, function (err) {
			if (err) throw err;
			console.log('database has been setup');
			if (isTest) {
				addUsers();
			} else {
				done();
			}
		});
	});

function addUsers() {
	var users = Users.forge();
	_.times(numUsers, function (i) {
		users.add(User.randomForge());
	});
	users.invokeThen('register')
		.then(function () {
			console.log('%d users added', numUsers);
			done();
		});
}

function done() {
	execsql.end();
	process.exit();
}
