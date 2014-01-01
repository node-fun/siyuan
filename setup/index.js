var _ = require('underscore'),
	chance = new (require('chance'))(),
	execsql = require('execsql'),
	config = require('../config'),
	env = config.env,
	connConfig = config.db.connection,
	dbName = connConfig.database,
	User = require('../models/user'),
	UserFriendship = require('../models/user-friendship'),
	Users = User.Set,
	numUsers = 100,
	sqlFile = __dirname + '/db.sql',
	users;

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
	return users
		.mapThen(function (user) {
			var p = f(user);
			_.times(_.random(2, 5), function () {
				p = p.then(f);
			});
			return p;
		}).then(function () {
			console.log('friends attached');
		});
	function f(user) {
		var friendid = _.random(1, numUsers);
		return UserFriendship
			.addFriendship(user.id, friendid, chance.word())
			.then(function () {
				return user;
			});
	}
}

function createUsers() {
	users = Users.forge();
	_.times(numUsers, function (i) {
		users.add(User.randomForge());
	});
	return users.invokeThen('register')
		.then(function () {
			console.log('%d users created', numUsers);
		});
}

function done() {
	execsql.end();
	process.exit();
}
