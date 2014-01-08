var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserActivity, UserActivities;

UserActivity = module.exports = syBookshelf.Model.extend({
	table: 'user_activities',
	fields: [
		'id', 'userid', 'activityid', 'iscanceled', 'isaccepted'
	],

	saving: function () {
		return ret = UserActivity.__super__
			.saving.apply(this, arguments);
	}
}, {
	randomForge: function () {
		return UserActivity.forge({
			'userid': chance.integer({
				min: 25,
				max: 50
			}),
			iscanceled: chance.bool(),
			isaccepted: chance.bool()
		});
	}
});

UserActivities = UserActivity.Set = syBookshelf.Collection.extend({
	model: UserActivity
});