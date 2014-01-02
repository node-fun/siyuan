var _ = require('underscore'),
	chance = new (require('chance'))(),
	execsql = require('execsql'),
	config = require('../config'),
	env = config.env,
	connConfig = config.db.connection,
	dbName = connConfig.database,
	User = require('../models/user'),
	Users = User.Set,
	numUsers = 100,
	sqlFile = __dirname + '/db.sql';

// create database for test
execsql.config(connConfig)
	.exec([
	'DROP SCHEMA IF EXISTS ' + dbName,
	'CREATE SCHEMA ' + dbName,
	'USE ' + dbName
].join('; '), function (err) {
		if (err) throw err;
		execsql.execFile(sqlFile, function (err) {
			if (err) throw err;
			console.log('database setup');
			if (env == 'test' || env == 'development') {
				createUsers()
					.then(attachFriends)
					.then(done);
			} else {
				done();
			}
		});
	});

function attachFriends() {
	return Users.forge().fetch().then(function (users) {
		return users
			.mapThen(function (user) {
				var numFriends = _.random(2, 5), p;
				_.times(numFriends, function () {
					if (!p) return p = f(user);
					p = p.then(f);
				});
				return p;
			}).then(function () {
				console.log('friends attached');
			});
	});
	function f(user) {
		var friendid = _.random(1, numUsers);
		return user.addFriend(friendid, chance.word());
	}
}

function createUsers() {
	var users = Users.forge();
	_.times(numUsers, function (i) {
		users.add(User.randomForge());
	});
	return users.invokeThen('register')
		.then(function () {
			return users
				.mapThen(function (user) {
					// login or not
					if (chance.bool()) return;
					return user.login();
				}).then(function () {
					console.log('%d users created', numUsers);
				});
		});
}

function done() {
	execsql.end();
	process.exit();
}
