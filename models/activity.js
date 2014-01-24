var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	errors = require('../lib/errors'),
	syBookshelf = require('./base'),
	User = require('./user'),
	Users = User.Set,
	ActivityStatus = require('./activity-status'),
	ActivityStatuses = ActivityStatus.Set,
	UserActivity = require('./user-activity'),
	UserActivitys = UserActivity.Set,
	GroupMembers = require('./group-membership'),
	GroupMembersSet = GroupMembers.Set,
	Group = require('./group'),
	config = require('../config'),
	avatarDir = config.activityAvatarDir,
	avatarExt = config.avatarExt,
	fkActivity = 'activityid',
	fkOwner = 'ownerid',
	fkStatus = 'statusid',
	Activity, Activities;

Activity = module.exports = syBookshelf.Model.extend({
	tableName: 'activities',
	fields: [
		'id', 'ownerid', 'groupid', 'content', 'maxnum', 'createtime',
		'starttime', 'duration', 'statusid', 'avatar', 'money', 'name', 'site'
	],

	saving: function () {
		return Activity.__super__
			.saving.apply(this, arguments);

	},
	usership: function () {
		return this.hasMany(UserActivitys, fkActivity);
	},
	countUsership: function(){
		var self = this;
		UserActivitys.forge().query()
			.where(fkActivity,'=',self.id)
			.count('id')
			.then(function(d){
				return self.data('numUsership', d[0]["count(`id`)"]);
			});
	},

	status: function () {
		return this.belongsTo(ActivityStatus, fkStatus);
	},
	user: function () {
		return this.belongsTo(User, fkOwner);
	},

	createActivity: function (userid, groupid, content, maxnum, starttime, duration, statusid, money, name, site) {
		//check the dude belong to group
		//save an activity
		if (userid == null) {
			return Promise.rejected(errors[21301]);
		}
		return GroupMembers.forge({
			'groupid': groupid,
			'userid': userid
		}).fetch().then(function (groupmember) {
				if (groupmember == null) return Promise.rejected(errors[40001]);
				return Activity.forge({
					'ownerid': userid,
					'groupid': groupid,
					'content': content,
					'maxnum': maxnum,
					'createtime': new Date(),
					'starttime': starttime,
					'duration': duration,
					'statusid': statusid,
					'money': money,
					'name': name,
					'site': site
				}).save();
			});
	},

	joinActivity: function (userid) {
		//check 'user in group'
		var groupid = this.get('groupid');
		return this.load(['usership', 'status']).then(function (activity) {
			return Group.forge({
				'id': groupid
			}).fetch()
				.then(function (group) {
					return group.load(['members'])
						.then(function (group) {
							var members = group.related('members').models;
							var isfounded = false;
							_.each(members, function (member) {
								if (member.get('userid') == userid) {
									isfounded = true;
								}
							});
							if (!isfounded) return Promise.rejected(errors[40001]);

							isfounded = false;//use it again
							var userships = activity.related('usership').models;
							_.each(userships, function (usership) {
								if (usership.get('userid') == userid) {
									isfounded = true;
								}
							});
							if (isfounded) return Promise.rejected(errors[40002]);

							var statusid = activity.related('status').get('id');
							if (statusid == 2) return Promise.rejected(errors[40012]);
							if (statusid == 3) return Promise.rejected(errors[40013]);
							if (statusid == 4) return Promise.rejected(errors[40014]);

							if (statusid == 1) {
								return UserActivity.forge({
									'userid': userid,
									'activityid': activity.get('id'),
									'isaccepted': false
								}).save();
							} else {
								return Promise.rejected(errors[40015]);
							}
						})
				});
		});
	},
	cancelActivity: function (userid) {
		var self = this;
		if (userid == null) {
			return Promise.rejected(errors[21301]);
		}
		return self.load(['usership']).then(function (activity) {
			var userships = activity.related("usership").models;
			isfounded = false;
			_.each(userships, function (usership) {
				if (usership.get('userid') == userid) {
					isfounded = true;
				}
			});
			if (isfounded)
				return UserActivity.forge({
					'userid': userid,
					'activityid': self.get('id')
				}).fetch().then(function (usership) {
						if (usership.get('isaccepted') == 1)
							return Promise.rejected(errors[40016]);
						return usership.destroy();
					});
		})

	},
	endActivity: function (userid) {
		if (userid == null) {
			return Promise.rejected(errors[21301]);
		}
		var self = this,
			groupid = self.get('groupid');
		return self.load(['usership']).then(function (activity) {
			if (!(self.get('ownerid') == userid)) {
				return Promise.rejected(errors[20102]);
			}
			return self.set({
				'statusid': 4
			}).save();
		});
	},
	updateActivity: function (userid, content, maxnum, starttime, duration, statusid, money, name, site) {
		var ownerid = this.get('ownerid');
		if (userid != ownerid) {
			return Promise.rejected(errors[20102]);
		}
		if (userid == null) {
			return Promise.rejected(errors[21301]);
		}
		return this.set({
			'content': content,
			'maxnum': maxnum,
			"starttime": starttime,
			'duration': duration,
			'statusid': statusid,
			'money': money,
			'name': name,
			'site': site
		}).save();
	},

	getUserList: function (userid) {
		var self = this;
		return GroupMembers.forge({
			'groupid': self.get('groupid'),
			'userid': userid
		}).fetch().then(function (groupmember) {
				if (groupmember == null) return Promise.rejected(errors[40001]);
				return self.load(['usership']).then(function (activity) {
					var userships = activity.related('usership');
					return userships.mapThen(function (usership) {
						return User.forge({ 'id': usership.get('userid') })
							.fetch()
							.then(function (user) {
								return usership.set({ 'name': user.get('username') });
							});
					}).then(function (userships) {
							return userships;
						});

				});
			});
	},

	acceptJoin: function (userid, usershipid) {
		var self = this,
			ownerid = self.get('ownerid');
		if (userid != ownerid) return Promise.rejected(errors[20102]);
		return UserActivity.forge({ 'id': usershipid }).fetch()
			.then(function (usership) {
				return usership.set({ 'isaccepted': true }).save();
			});
	},

	updateAvatar: function (tmp) {
		var file = Activity.getAvatarPath(this.id),
			self = this;
		return new Promise(function (resolve, reject) {
			fs.readFile(tmp, function (err, data) {
				if (err) return reject(errors[30000]);
				fs.writeFile(file, data, function (err) {
					if (err) return reject(errors[30001]);
					resolve(self);
				});
			});
		});
	}
}, {
	randomForge: function () {
		var status = _.random(1, 4),
			maxnum = _.random(20, 40),
			duration = _.random(3, 10);
		return Activity.forge({
			'content': chance.paragraph(),
			'maxnum': maxnum,
			'createtime': chance.date({ year: 2013 }),
			'starttime': chance.date({ year: 2013 }),
			'duration': duration,
			'statusid': status,
			'avatar': chance.word(),
			'money': chance.integer({
				min: 600,
				max: 1200
			}),
			'name': chance.word(),
			'site': chance.word()
		});
	},

	find: function (query) {
		var forActivity = ['id', 'ownerid', 'groupid', 'content', 'statusid', 'name'],
			activities = Activities.forge();
		return activities
			.query(function (qb) {
				_.each(forActivity, function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				})
			})
			.query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch({
				withRelated: ['user.profile']
			});
	},

	getAvatarName: function (id) {
		return id + avatarExt;
	},
	getAvatarPath: function (id) {
		return path.join(avatarDir, Activity.getAvatarName(id));
	},
	getAvatarURI: function (id) {
		return 'activities' + Activity.getAvatarName(id);
	}
});

Activities = Activity.Set = syBookshelf.Collection.extend({
	model: Activity
});
