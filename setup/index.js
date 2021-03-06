var fs = require('fs-extra'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	localface = require('localface'),
	execsql = require('execsql'),
	config = require('../config'),
	env = config.env,
	connConfig = config.db.connection,
	dbName = connConfig.database,
	syBookshelf = require('../models/base'),
	User = require('../models/user'),
	Users = User.Set,
	Followship = require('../models/followship'),
	Followships = Followship.Set,
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
	IssueComment = require('../models/issue-comment'),
	IssueComments = IssueComment.Set,
	Photo = require('../models/photo'),
	Photos = Photo.Set,
	Cooperation = require('../models/cooperation'),
	Cooperations = Cooperation.Set,
	CoComment = require('../models/co-comment'),
	CoComments = CoComment.Set,
	UserCooperation = require('../models/user-cooperation'),
	UserCooperations = UserCooperation.Set,
	Ad = require('../models/ad'),
	Ads = Ad.Set,
	Starship = require('../models/starship'),
	Starships = Starship.Set,
	numUsers = 35,
	numFollowship = numUsers * 3,
	numGroups = ~~(numUsers / 5),
	numGroupMembers = numGroups * 2,
	numActivities = numGroups * 3,
	numUserActivitys = numActivities * 2,
	numIssues = numUsers * 3,
	numComments = numIssues * 4,
	numPhotos = numUsers * 3,
	numStarship = numUsers * 4,
	numEvents = numUsers * 4,
	numCooperations = ~~(numUsers / 5),
	numUserCooperations = numCooperations * 3,
	numCoComments = numCooperations * 3,
	sqlFile = __dirname + '/db.sql';

// copy directories
try {
	fs.removeSync(config.contentDir);
	fs.copySync(config.defaultContentDir, config.contentDir);
	fs.removeSync(config.staticDir + '/ad/img');
	fs.copySync(config.staticDir + '/ad/img.default', config.staticDir + '/ad/img');
	console.log('content directory reset');
} catch (err) {
	done(err);
}

// create database for test
execsql.config(connConfig)
	.exec([
	'DROP SCHEMA IF EXISTS ' + dbName,
	'CREATE SCHEMA ' + dbName + ' character set utf8',
	'USE ' + dbName
].join('; '), function (err) {
		if (err) throw err;
		execsql.execFile(sqlFile, function (err) {
			if (err) throw err;
			console.log('database setup');
			if (env != 'production') {
				addSystemUser()//please make this first to ensure the systemid is 1
					.then(addUsers)
					.then(addFollowship)
					.then(addAdmins)
					.then(addGroups)
					.then(addGroupMembers)
					.then(addActivities)
					.then(addUserActivitys)
					.then(addIssues)
					.then(addComments)
					.then(addPhotos)
					.then(addCooperations)
					.then(addUserCooperations)
					.then(addCoComments)
					.then(addStarship)
					.then(addAd())
					.then(done)
					.catch(done);
			} else {
				addSystemUser()//please make this first to ensure the systemid is 1
					.then(addAd)
					.then(addAdmins)
					.then(done)
					.catch(done);
			}
		});
	});

function addUsers() {
	var users = Users.forge();
	// add a stable user for test
	users.add(User.randomForge().set({
		username: 'test',
		password: 'test',
		profile: {
			name: 'Jayin Ton',
			email: 'jayin@fuck.shit',
			summary: 'I am a boy!'
		},
		isonline: 1	// make it online
	}));
	_.times(numUsers - users.length, function () {
		users.add(User.randomForge());
	});
	return users.invokeThen('register')
		.then(function () {
			return users.mapThen(function (user) {
				// copy avatar
				var gender = user.data('profile')['gender'],
					face = localface.get(gender),
					cover = localface.get(gender);
				return user.updateAsset('avatar', face)
					.then(function () {
						return user.updateAsset('cover', cover);
					})
					.then(function () {
						// login or not
						return user.get('isonline') || chance.bool() ? user.login(true) : user;
					});
			});
		}).then(function () {
			console.log('%d users added', users.length);
		}).catch(done);
}

//add a system user for sending system message
function addSystemUser() {
	return User.forge({
		username: 'System',
		password: chance.string(),
		avatar: null,
		profile: {
			name: 'System',
			email: config.smtp.auth.user,
			summary: 'This is the system account.'
		}
	}).register()
		.then(function () {
			console.log('%d system user added', 1);
		}).catch(done);
}

function addFollowship() {
	var followships = Followships.forge();
	_.times(numFollowship, function () {
		var followship = Followship.forge({
			userid: _.random(1, numUsers),
			followid: _.random(1, numUsers),
			remark: chance.word()
		});
		followships.add(followship);
	});
	return followships
		.mapThen(function (followship) {
			return followship.save().catch(function () {
				followships.remove(followship);
			});
		}).then(function () {
			console.log('%d followship added', numFollowship = followships.length);
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
			name: chance.word() + '_' + _.random(0, 999),
			description: chance.paragraph(),
			createtime: chance.date({ year: 2013 })
		}));
	});
	return groups
		.mapThen(function (group) {
			return group.save()
				.catch(function () {
					groups.remove(group);
				});
		}).then(function () {
			console.log('%d groups added', numGroups = groups.length);
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
	return groupmembers
		.mapThen(function (groupmember) {
			return groupmember.save()
				.catch(function () {
					groupmembers.remove(groupmember);
				});
		}).then(function () {
			console.log('%d groupmembers added', numGroupMembers = groupmembers.length);
		});
}

function addActivities() {
	var activities = Activities.forge();
	var i = 1;
	_.times(numActivities, function () {
		activities.add(Activity.randomForge().set({
			'ownerid': _.random(1, numUsers),
			'groupid': i,
			'statusid': 1
		}));
		if (i < numGroups) i++;  //it will influence activity test, please don't recorrect it
	});
	return activities.invokeThen('save')
		.then(function () {
			return activities.mapThen(function (activity) {
				//copy avatar
				var gender = 'f',
					face = localface.get(gender);
				return activity.updateAsset('avatar', face);
			});
		}).then(function () {
			console.log('%d activities added', numActivities);
		}).catch(done);
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
	return useractivitys
		.mapThen(function (useractivity) {
			return useractivity.save()
				.catch(function () {
					useractivitys.remove(useractivity);
				});
		}).then(function () {
			console.log('%d useractivitys added', numUserActivitys = useractivitys.length);
		})
}

function addUserCooperations() {
	var usercooperations = UserCooperations.forge();
	_.times(numUserCooperations, function () {
		usercooperations.add(UserCooperation.forge({
			'userid': _.random(1, numUsers),
			'cooperationid': _.random(1, numCooperations),
			'isaccepted': false
		}));
	});
	return usercooperations.invokeThen('save')
		.then(function () {
			console.log('%d usercooperations added', numCooperations);
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
function addComments() {
	var comments = IssueComments.forge();
	_.times(numComments, function () {
		var comment = IssueComment.randomForge();
		comment.set('userid', _.random(1, numUsers));
		comment.set('issueid', _.random(1, numIssues));
		comments.add(comment);
	});
	return comments.invokeThen('save')
		.then(function () {
			console.log('%d comments added', numComments);
		});
}

function addPhotos() {
	var photos = Photos.forge();
	_.times(numPhotos, function () {
		var photo = Photo.randomForge(),
			face = localface.get(_.sample(['f', 'm']));
		photo.set('userid', _.random(1, numUsers)).data('image', face);
		photos.add(photo);
	});
	return photos.invokeThen('save')
		.then(function () {
			console.log('%d photos added', numPhotos);
		});
}

function addStarship() {
	var starships = Starships.forge();
	_.times(numStarship, function () {
		var starship = Starship.forge({
			userid: _.random(1, numUsers),
			itemtype: config.entities.indexOf(_.sample(Starship.typesAllowed)) + 1,
			itemid: _.random(1, 20),
			remark: chance.word()
		});
		starships.add(starship);
	});
	return starships
		.mapThen(function (starship) {
			return starship.save().catch(function () {
				starships.remove(starship);
			});
		}).then(function () {
			console.log('%d starship added', numStarship = starships.length);
		});
}

function addCooperations() {
	var cooperations = Cooperations.forge();
	_.times(numCooperations, function () {
		cooperations.add(Cooperation.randomForge().set({ 'isprivate': false }));
	});
	return cooperations.invokeThen('save')
		.then(function () {
			return cooperations.mapThen(function (cooperation) {
				//copy avatar
				var gender = 'f',
					face = localface.get(gender);
				return cooperation.updateAsset('avatar', face);
			});
		})
		.then(function () {
			console.log('%d cooperations added', numCooperations);
		}).catch(done);
}

function addCoComments() {
	var cocomments = CoComments.forge();
	_.times(numCoComments, function () {
		var cocomment = CoComment.randomForge();
		cocomment.set('userid', _.random(1, numUsers));
		cocomment.set('cooperationid', _.random(1, numCooperations));
		cocomments.add(cocomment);
	});
	return cocomments.invokeThen('save')
		.then(function () {
			console.log('%d cocomments added', numCoComments);
		});
}

function addAd() {
	var ads = Ads.forge(),
		numAds = 3;
	_.times(numAds, function (i) {
		i += 1;
		ads.add(Ad.forge({
			title: '公告' + i,
			content: '公告' + i + '内容，' +
				'<p>此内容仅供测试</p>' +
				'<p>正式上线请在后台删除此条公告</p>',
			picture: '/ad/img/' + i + '.jpg'
		}));
	});
	return ads.invokeThen('save')
		.then(function () {
			console.log('%d Ad added', numAds);
		});
}

function done(err) {
	if (err) console.error(err.stack);
	execsql.end();
	process.exit();
}
