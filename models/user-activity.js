var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserActivity, UserActivitys,
	fkUser = 'userid';

UserActivity = module.exports = syBookshelf.Model.extend({
	tableName: 'user_activity',
	fields: [
		'id', 'userid', 'activityid', 'isaccepted'
	],
	user: function () {
		return this.belongsTo(require('./user'), fkUser);
	}
}, {
	find: function (query) {
		var forUserActivity = ['id', 'userid', 'activityid', 'isaccepted'],
			useracitvitys = UserActivitys.forge();
		return useracitvitys
			.query(function (qb) {
				_.each(forUserActivity, function (k) {
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

UserActivitys = UserActivity.Set = syBookshelf.Collection.extend({
	model: UserActivity
});