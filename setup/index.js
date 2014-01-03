var fs = require('fs'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	localface = require('localface'),
	execsql = require('execsql'),
	config = require('../config'),
	env = config.env,
	connConfig = config.db.connection,
	dbName = connConfig.database,
	User = require('../models/user'),
	Users = User.Set,
	Admin = require('../models/admin'),
	Admins = Admin.Set,
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
					.then(addAdmins)
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
	_.times(numUsers, function () {
		users.add(User.randomForge());
	});
	return users.invokeThen('register')
		.then(function () {
			return users
				.mapThen(function (user) {
					// copy avatar
					var gender = user.related('profile').get('gender'),
						face = localface.get(gender);
					fs.createReadStream(face).pipe(
						fs.createWriteStream(User.getAvatar(user.id))
					);
					// login or not
					if (chance.bool()) return;
					return user.login();
				}).then(function () {
					console.log('%d users created', numUsers);
				});
		});
}

function addAdmins() {
	var admins = Admins.forge(),
		adminArr = config.admins,
		numAdmins = adminArr.length;
	_.times(numAdmins, function (i) {
		admins.add(Admin.forge({
			username: adminArr[i].username,
			password: adminArr[i].password
		}));
	});
	return admins.invokeThen('register')
		.then(function () {
			console.log('%d admins added', numAdmins);
			done();
		});
}

function done() {
	execsql.end();
	process.exit();
}
