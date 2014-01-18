var fs = require('fs-extra'),
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
	Group = require('../models/group'),
	Groups = Group.Set,
	Activity = require('../models/activity'),
	Activities = Activity.Set,
	UserActivity = require('../models/user-activity'),
	UserActivitys = UserActivity.Set,
	GroupMembership = require('../models/group-membership'),
	GroupMembershipSet = GroupMembership.Set,
	Issue = require('../models/issue'),
	Issues = Issue.Set,
	Photo = require('../models/photo'),
	Photos = Photo.Set,
	numUsers = 35,
	numGroups = ~~(numUsers / 5),
	numGroupMembers = numGroups * 10,
	numActivities = numGroups * 2,
	numUserActivitys = numActivities * 5,
	numIssues = numUsers * 3,
	numPhotos = numUsers * 3,
	sqlFile = __dirname + '/db.sql';

// copy directories
try {
	fs.removeSync(config.contentDir);
	fs.copySync(config.defaultContentDir, config.contentDir);
	console.log('content directory reset');
} catch(err) {
	done(err);
}

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
			if (env != 'production') {
				createUsers()
					.then(attachFriends)
					.then(addAdmins)
					.then(addGroups)
					.then(addGroupMembers)
					.then(addActivities)
					.then(addUserActivitys)
					.then(addIssues)
					.then(addPhotos)
					.then(done)
					.catch(done);
			} else {
				done();
			}
		});
	});

function createUsers() {
	var users = Users.forge();
	_.times(numUsers, function () {
		users.add(User.randomForge());
	});
	return users
		.mapThen(function (user) {
			return user.register().catch(function () {
				users.remove(user);
			});
		}).then(function () {
			return users.mapThen(function (user) {
				// copy avatar
				var gender = user.get('profile')['gender'],
					face = localface.get(gender);
				fs.createReadStream(face).pipe(
					fs.createWriteStream(User.getAvatarPath(user.id))
				);
				// login or not
				if (chance.bool()) return;
				return user.login();
			});
		}).then(function () {
			console.log('%d users created', numUsers);
		}).catch(done);
}
function attachFriends() {
	return Users.forge().fetch()
		.then(function (users) {
			return users.mapThen(function (user) {
				var numFriends = _.random(1, 7), p;
				_.times(numFriends, function () {
					if (!p) return p = f(user);
					p = p.then(f);
				});
				return p;
			});
		}).then(function () {
			console.log('friends attached');
		});
	function f(user) {
		return user
			.addFriend({
				friendid: _.random(1, numUsers),
				remark: chance.word()
			}).catch(function () {
				return user;
			});
	}
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
	return admins.invokeThen('save')
		.then(function () {
			console.log('%d admins added', numAdmins);
		});
}

function addGroups() {
	var groups = Groups.forge();
	_.times(numGroups, function () {
		groups.add(Group.forge({
			ownerid: _.random(1, numUsers),
			name:  chance.word() + '_' + (''+Date.now()).slice(-2, -1),
			description: chance.paragraph(),
			createtime: chance.date({ year: 2013 })
		}));
	});
	return groups.invokeThen('save')
		.then(function () {
			console.log('%d groups added', numGroups);
		});
}
function addGroupMembers() {
	var groupmembers = GroupMembershipSet.forge();
	_.times(numGroupMembers, function () {
		groupmembers.add(GroupMembership.forge({
			'groupid': _.random(1, numGroups),
			'userid': _.random(1, numUsers),
			'isowner': chance.bool(),
			'isadmin': chance.bool(),
			'remark': chance.word()
		}));
	});
	return groupmembers.invokeThen('save')
		.then(function () {
			console.log('%d groupmembers added', numGroupMembers);
		});
}

function addActivities() {
	var activities = Activities.forge();
	_.times(numActivities, function () {
		activities.add(Activity.randomForge().set({
			'ownerid': _.random(1, numUsers),
			'groupid': _.random(1, numGroups)
		}));
	});
	return activities.invokeThen('save')
		.then(function () {
			console.log('%d activities added', numActivities);
		});
}

function addUserActivitys() {
	var useractivitys = UserActivitys.forge();
	_.times(numUserActivitys, function () {
		useractivitys.add(UserActivity.forge({
			'userid': _.random(1, numUsers),
			'activityid': _.random(1, numActivities),
			isaccepted: chance.bool()
		}));
	});
	return useractivitys.invokeThen('save')
		.then(function () {
			console.log('%d useractivitys added', numUserActivitys);
		});
}

function addIssues() {
	var issues = Issues.forge();
	_.times(numIssues, function () {
		var issue = Issue.randomForge();
		issue.set('userid', _.random(1, numUsers));
		issues.add(issue);
	});
	return issues.invokeThen('save')
		.then(function () {
			console.log('%d issues added', numIssues);
		});
}

function addPhotos() {
	var photos = Photos.forge();
	_.times(numPhotos, function () {
		var photo = Photo.randomForge(),
			face = localface.get(_.sample(['f', 'm']));
		photo.set({
			userid: _.random(1, numUsers),
			image: face
		});
		photos.add(photo);
	});
	return photos.invokeThen('save')
		.then(function () {
			console.log('%d photos added', numPhotos);
		});
}

function done(err) {
	if (err) console.error(err.stack);
	execsql.end();
	process.exit();
}
