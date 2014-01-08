var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserActivity, UserActivities;

UserActivity = models.exports = syBookshelf.Model.extend({
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
			iscanceled: chance.bool(),
			isaccepted: chance.bool()
		});
	}
});

UserActivities = UserActivity.Set = syBooksheld.Collection.extend({
	model: UserActivity
});