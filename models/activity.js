var _ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	syBookshelf = require('./base'),
	User = require('./user'),
	Users = User.Set,
	ActivityStatus = require('./activity-status'),
	ActivityStatuses = ActivityStatus.Set,
	UserActivity = require('./user-activity'),
	UserActivitys = UserActivity.Set,
	GroupMembers = require('./group_members'),
	GroupMembersSet = GroupMembers.Set,
	Group = require('./groups'),
	fkActivity = 'activityid',
	fkStatus = 'statusid',
	Activity, Activities,
	errors = require('../lib/errors');

Activity = module.exports = syBookshelf.Model.extend({
	tableName: 'activities',
	fields: [
		'id', 'ownerid', 'groupid', 'content', 'maxnum', 'createtime',
		'starttime', 'duration', 'statusid', 'avatar'
	],

	saving: function () {
		return Activity.__super__
			.saving.apply(this, arguments);

	},
	usership: function () {
		return this.hasMany(UserActivitys, fkActivity);
	},

	status: function () {
		return this.belongsTo(ActivityStatus, fkStatus);
	},

	joinActivity: function (userid) {
		//check 'user in group'
		var groupid = this.get('groupid');
		return this.load(['usership', 'status']).then(function(activity) {
			return Group.forge({
				'id': groupid
			}).fetch()
			.then(function(group) {
				return group.load(['members'])
					.then(function(group) {
						var members = group.related('members').models;
							var isfounded = false;
						_.each(members, function(member) {
							if(member.get('userid') == userid) {
								isfounded = true;
							}
						});
						if(!isfounded) return Promise.rejected(errors[40001]);

						isfounded = false;//use it again
						var userships = activity.related('usership').models;
						_.each(userships, function(usership) {
							if(usership.get('userid') == userid){
								isfounded = true;
							}
						});
						if(!isfounded) return Promise.rejected(errors[40002]);



						UserActivity.forge({
							'userid': userid,
							'activityid': this.id,
							'isaccepted': false
						}).save();
				})
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
			'createtime': new Date(),
			'starttime': chance.date({ string: true }),
			'duration': duration,
			'statusid': status,
			'avatar': chance.word()
		});
	},

	find: function (query) {
		var forActivity = ['id', 'ownerid', 'groupid', 'content', 'statusid'],
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
			.fetch();
	}
});

Activities = Activity.Set = syBookshelf.Collection.extend({
	model: Activity
});
