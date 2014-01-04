var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	Activity, Activities;

Activity = modele.exports = syBookshelf.Model.extend({
	tableName: 'activities',
	fields: [
		'ownerid', 'groupid', 'content', 'maxnum', 'createtime',
		'starttime', 'duration', 'statusid'
	],
	omitInJSON: ['ownerid', 'groupid'],
	saving: function() {
		return Activity.__super__
			.saving.apply(this, arguments);
	}
}, {
	randomForge: function() {
		var status = _.random(0, 3),
			maxnum = _.random(20, 40);
			duration = _.random(3, 10);
		return Activity.forge({
			'content': chance.paragraph(),
			'maxnum': maxnum,
			'createtime': new Date(),
			'starttime': chance.date({string: true}),
			'duration': chance.(),
			'statusid': status
		});
	}
});

Activities = Activity.Set = syBookshelf.Collection.extend({
	model: Activity
});
