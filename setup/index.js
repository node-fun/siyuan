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
	Group = require('../models/group'),
	Groups = Group.Set,
	ActivityStatus = require('../models/activity-status'),
	ActivityStatuses = ActivityStatus.Set,
	Activity = require('../models/activity'),
	Activities = Activity.Set,
	UserActivity = require('../models/user-activity'),
	UserActivitys = UserActivity.Set,
	GroupMembers = require('../models/group-membership'),
	GroupMembersSet = GroupMembers.Set,
	Issue = require('../models/issue'),
	Issues = Issue.Set,
	numUsers = 100,
	numGroups = 20,
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
			if (env != 'production') {
				createUsers()
					.then(attachFriends)
					.then(addAdmins)
					.then(addGroups)
					.then(addGroupMembers)
					.then(addActivityStatuses)
					.then(addActivities)
					.then(addUserActivitys)
					.then(addIssues)
					.then(done);
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
				var numFriends = _.random(2, 5), p;
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
		var friendid = _.random(1, numUsers);
		return user.addFriend(friendid, chance.word())
			.catch(function () {
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
		groups.add(Group.forge());
	});
	return groups.invokeThen('save')
		.then(function () {
			console.log('%d groups added', numGroups);
		});
}
function addGroupMembers() {
	var numGroupMembers = 100,
		groupmembers = GroupMembersSet.forge();
	_.times(numGroupMembers, function () {
		groupmembers.add(GroupMembers.randomForge());
	});
	return groupmembers.invokeThen('save')
		.then(function () {
			console.log('%d groupmembers added', numGroupMembers);
		});
}

function addActivityStatuses() {
	var activityStatuses = ActivityStatuses.forge(),
		activityStatusArr = config.activitiesStatus,
		numActivityStatuses = activityStatusArr.length;
	_.times(numActivityStatuses, function (i) {
		activityStatuses.add(ActivityStatus.forge({
			name: activityStatusArr[i]
		}));
	});
	return activityStatuses.invokeThen('save')
		.then(function () {
			console.log('activity-status initialed');
		});
}
function addActivities() {
	var numActivities = 20,
		activities = Activities.forge();
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
	var numUserActivitys = 100,
		useractivitys = UserActivitys.forge();
	_.times(numUserActivitys, function () {
		useractivitys.add(UserActivity.randomForge());
	});
	return useractivitys.invokeThen('save')
		.then(function () {
			console.log('%d useractivitys added', numUserActivitys);
		});
}

function addIssues() {
	var numIssues = numUsers * 6,
		issues = Issues.forge();
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

function done(err) {
	if (err) throw err;
	execsql.end();
	process.exit();
}
