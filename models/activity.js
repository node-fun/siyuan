var _ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	syBookshelf = require('./base'),
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
	omitInJSON: ['ownerid', 'groupid'],
	saving: function () {
		return Activity.__super__
			.saving.apply(this, arguments);
	}/*,
	 addActivity: function('content', 'maxnum', 'createtime', 'starttime', 'duration', 'statusid') {
	 var keys = ['content', 'maxnum', 'createtime', 'starttime', 'duration', 'statusid'],
	 registerData = this.pick(keys);
	 if(!_.all(keys, function(key) {
	 return registerData[key];
	 })) {
	 return Promise.rejected(errors[10008]);
	 }
	 return Activity.forge(registerData).save();
	 }*/    //copy user-friendship.js
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
		var forActivity = ['id', 'username'];
		return Activities.forge()
			.query(function (qb) {
				_.each(forActivity, function (qb) {
					if (k in match) {
						qb.where(k, '=', match[k]);
					}
				})
			})
			.query('offset', offset)
			.query('limit', limit)
			.fetch();
	}
});

Activities = Activity.Set = syBookshelf.Collection.extend({
	model: Activity
});
