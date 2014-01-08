var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserActivity, UserActivitys;

UserActivity = module.exports = syBookshelf.Model.extend({
	tableName: 'user_activity',
	fields: [
		'id', 'userid', 'activityid', 'iscanceled', 'isaccepted'
	],

	saving: function () {
		return UserActivity.__super__
			.saving.apply(this, arguments);
	}
}, {
	randomForge: function () {
		return UserActivity.forge({
			'userid': chance.integer({
				min: 25,
				max: 50
			}),
			'activityid': chance.integer({
				min: 1,
				max: 10
			}),
			iscanceled: chance.bool(),
			isaccepted: chance.bool()
		});
	}
});

UserActivitys = UserActivity.Set = syBookshelf.Collection.extend({
	model: UserActivity
});