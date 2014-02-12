var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	errors = require('../lib/errors'),
	syBookshelf = require('./base'),
	ActivityStatus = require('./activity-status'),
	UserActivity = require('./user-activity'),
	UserActivitys = UserActivity.Set,
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
		'starttime', 'duration', 'statusid', 'avatar', 'money', 'name', 'site',
		'regdeadline'
	],
	withRelated: ['user.profile', 'status'],

	defaults: function () {
		return {
			createtime: new Date()
		}
	},

	toJSON: function () {
		var ret = Activity.__super__.toJSON.apply(this, arguments);
		// to avatar uri fi exists
		if (this.get('avatar')) {
			ret['avatar'] = Activity.getAvatarURI(this.id) + '?t=' + ret['avatar'];
		}
		return ret;
	},

	saving: function () {
		return Activity.__super__
			.saving.apply(this, arguments);
	},
	usership: function () {
		return this.hasMany(UserActivitys, fkActivity);
	},

	fetch: function (options) {
		return Activity.__super__.fetch.call(this, options)
			.then(function (activity) {
				if (!activity) return activity;
				return activity.countUsership();
			})
	},

	countUsership: function () {
		var self = this;
		return UserActivitys.forge().query()
			.where(fkActivity, '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numUsership', d[0]["count(`id`)"]);
			});
	},

	status: function () {
		return this.belongsTo(ActivityStatus, fkStatus);
	},
	user: function () {
		return this.belongsTo(require('./user'), fkOwner);
	},

	updateAvatar: function (tmp) {
		var file = Activity.getAvatarPath(this.id),
			self = this;
		return new Promise(
			function (resolve, reject) {
				fs.readFile(tmp, function (err, data) {
					if (err) return reject(errors[30000]);
					fs.writeFile(file, data, function (err) {
						if (err) return reject(errors[30001]);
						resolve(self);
					});
				});
			}).then(function () {
				return self.set('avatar', Date.now()).save()
					.then(function () {
						return self;
					});
			}).catch(function (err) {
				return self.set('avatar', null).save()
					.then(function () {
						return Promise.rejected(err);
					})
			})
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
			'site': chance.word(),
			'regdeadline': chance.date({ year: 2013 })
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
			}).query(function (qb) {
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	},

	search: function (query) {
		var count = 0;
		return Activities.forge()
			.query(function (qb) {
				['name', 'content'].forEach(function (k) {
					if (k in query) {
						count++;
						qb.where(k, query[k]);
					}
				});
				['ownerid'].forEach(function (k) {
					if (k in query) {
						count++;
						qb.where(k, 'like', '%' + query[k] + '%');
					}
				});
			}).query(function (qb) {
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', count ? query['limit'] : 0)
			.fetch();
	},

	getAvatarName: function (id) {
		return id + avatarExt;
	},
	getAvatarPath: function (id) {
		return path.join(avatarDir, Activity.getAvatarName(id));
	},
	getAvatarURI: function (id) {
		return '/activities/' + Activity.getAvatarName(id);
	}
});

Activities = Activity.Set = syBookshelf.Collection.extend({
	model: Activity,

	fetch: function () {
		return Activities.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch');
			});
	}
});
