var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserActivity, UserActivitys,
	tvUserActivity = 'user_activity',
	fkUser = 'userid';

UserActivity = module.exports = syBookshelf.Model.extend({
	tableName: tvUserActivity,
	fields: [
		'id', 'userid', 'activityid', 'isaccepted'
	],
	user: function () {
		return this.belongsTo(require('./user'), fkUser);
	}
});

UserActivitys = UserActivity.Set = syBookshelf.Collection.extend({
	model: UserActivity,

	lister: function (req, qb) {
		var query = req.query;
		this.qbWhere(qb, req, query, ['id', 'userid', 'activityid', 'isaccepted']);
	}
});
