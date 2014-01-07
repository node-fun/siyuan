var _ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	syBookshelf = require('./base'),
	ActivityStatus = require('./activity-status'),
	ActivityStatuses = ActivityStatus.Set,
	fkOwner = 'ownerid',
	fkGroup = 'groupid',
	fkStatus = 'statusid',
	Activity, Activities;

Activity = module.exports = syBookshelf.Model.extend({
	tableName: 'activities',
	fields: [
		'id', 'ownerid', 'groupid', 'content', 'maxnum', 'createtime',
		'starttime', 'duration', 'statusid'
	],
	//omitInJSON: ['ownerid', 'groupid'],
	saving: function () {
		return Activity.__super__
			.saving.apply(this, arguments);
	}
}, {
	randomForge: function () {
		var status = _.random(1, 4),
			maxnum = _.random(20, 40);
		duration = _.random(3, 10);
		return Activity.forge({
			'content': chance.paragraph(),
			'maxnum': maxnum,
			'createtime': new Date(),
			'starttime': chance.date({string: true}),
			'duration': duration,
			'statusid': status
		});
	},

	find: function (match, offset, limit) {
		var forActivity = ['id', 'ownerid', 'groupid', 'content', 'statusid'],
			activities = Activities.forge();
		return activities
			.query(function (qb) {
				_.each(forActivity, function (k) {
					if (k in match) {
						qb.where(k, '=', match[k]);
					}
				})
			})
			.query('offset', offset)
			.query('limit', limit)
			.fetch()
			.then(function () {
				return activities.mapThen(function (activity) {
					var status = ActivityStatus.forge({
									'id': activity.get('statusid')
								})
								.fetch()
								.then(function(activitystatus){
									return activitystatus;
								})
								.get('name');

					activity.set({
						'status': status
					});
					return activity;
				})
			});
			//wait for help T^T

	}
});

Activities = Activity.Set = syBookshelf.Collection.extend({
	model: Activity
});
