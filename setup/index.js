var _ = require('underscore'),
	execsql = require('execsql'),
	config = require('../config'),
	isTest = config.isTest,
	connConfig = config.db.connection,
	User = require('../models/user'),
	Users = User.Collection,
	UserProfile = require('../models/user-profile'),
	UserProfiles = UserProfile.Collection,
	numUsers = 200,
	sqlFile = __dirname + '/db' + (isTest ? '_test' : '') + '.sql';

// create database for test
execsql.config(connConfig)
	.exec(sqlFile, function (err) {
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
	// add users
	var users = Users.forge(),
		userProfiles = UserProfiles.forge();
	_.times(numUsers, function (i) {
		users.add(User.randomForge());
		userProfiles.add(UserProfile.randomForge());
	});
	users.invokeThen('save')
		.then(function () {
			var firstId = users.at(0).id;
			userProfiles.each(function (profile, i) {
				profile.set({
					userid: firstId + i
				});
			});
			return userProfiles.invokeThen('save');
		}).then(function () {
			console.log('%d records inserted', numUsers);
			process.exit();
		});
}
