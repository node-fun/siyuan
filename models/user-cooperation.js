var _ = require('underscore'),
	syBookshelf = require('./base'),
	UserCooperation, UserCooperations,
	tbUserCooperation = 'user_cooperation',
	fkUser = 'userid';

UserCooperation = module.exports = syBookshelf.Model.extend({
	tableName: tbUserCooperation,
	fields: [
		'id', 'userid', 'cooperationid', 'isaccepted'
	],
	user: function () {
		return this.belongsTo(require('./user'), fkUser);
	}
}, {
	find: function (query) {
		var forUserCooperation = ['id', 'userid', 'cooperationid', 'isaccepted'],
			usercooperations = UserCooperations.forge();
		return usercooperations
			.query(function (qb) {
				_.each(forUserCooperation, function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			})
			.query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	}
});

UserCooperations = UserCooperation.Set = syBookshelf.Collection.extend({
	model: UserCooperation,

	lister: function (req, qb) {
		var query = req.query;
		this.qbWhere(qb, req, query, ['id', 'userid', 'cooperationid', 'isaccepted'], tbUserCooperation);
	}
});
