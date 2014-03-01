var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	ActivityStatus = require('./activity-status'),
	UserActivity = require('./user-activity'),
	UserActivities = UserActivity.Set,
	Picture = require('./picture'),
	Pictures = Picture.Set,
	config = require('../config'),
	fkActivity = 'activityid',
	fkOwner = 'ownerid',
	fkStatus = 'statusid',
	tbActivity = 'activities',
	Activity, Activities;

Activity = module.exports = syBookshelf.Model.extend({
	tableName: tbActivity,
	fields: [
		'id', 'ownerid', 'groupid', 'content', 'maxnum', 'createtime',
		'starttime', 'duration', 'statusid', 'avatar', 'money', 'name', 'site',
		'regdeadline'
	],
	appended: ['user', 'status'],
	fieldToAssets: { avatar: 'activities' },

	defaults: function () {
		return {
			createtime: new Date()
		}
	},

	toJSON: function () {
		var self = this, Model = this.constructor,
			ret = Model.__super__.toJSON.apply(this, arguments);
		_.each(this.fieldToAssets, function (type, field) {
			if (self.get(field) != null) {
				var file = self.getAssetPath(type);
				ret[field] = config.toStaticURI(file) + '?t=' + ret[field];
			}
		});
		return ret;
	},

	saving: function () {
		return Activity.__super__
			.saving.apply(this, arguments);
	},

	usership: function () {
		return this.hasMany(UserActivities, fkActivity);
	},

	pictures: function () {
		return this.hasMany(Picture, 'activityid');
	},

	fetched: function (model, attrs, options) {
		return Activity.__super__.fetched.apply(this, arguments)
			.return(model)
			.call('countUsership')
			.call('countPictures')
			.then(function () {
				if (!options['detailed']) return;
				return model.related('pictures').fetch();
			})
	},

	countUsership: function () {
		var self = this;
		return UserActivities.forge().query()
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
	countPictures: function () {
		var self = this;
		return Pictures.forge().query()
			.where(fkActivity, '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numPictures', d[0]["count(`id`)"]);
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
			'site': chance.word(),
			'regdeadline': chance.date({ year: 2013 })
		});
	}
});

Activities = Activity.Set = syBookshelf.Collection.extend({
	model: Activity,

	lister: function (req, qb) {
		var query = req.query;
		this.qbWhere(qb, req, query, ['id', 'ownerid', 'statusid'], tbActivity);
		if (!req.query['fuzzy']) {
			this.qbWhere(qb, req, query, ['name', 'site'], tbActivity);
		} else {
			this.qbWhereLike(qb, req, query, ['name', 'content', 'site'], tbActivity);
		}
	}
});
