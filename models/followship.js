var syBookshelf = require('./base'),
	Followship, FollowshipSet;

Followship = module.exports = syBookshelf.Model.extend({
	tableName: 'followship',
	fields: [
		'id', 'userid', 'followid', 'remark'
	],
	omitInJSON: ['id', 'userid', 'followid'],

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	},
	followee: function () {
		return this.belongsTo(require('./user'), 'followid');
	}
}, {
	findFollowing: function (query) {
		return FollowshipSet.forge()
			.query(function (qb) {
				['userid'].forEach(function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch({
				withRelated: ['followee.profile']
			});
	},
	findFollowers: function (query) {
		return FollowshipSet.forge()
			.query(function (qb) {
				['followid'].forEach(function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch({
				withRelated: ['user.profile']
			});
	}
});

FollowshipSet = Followship.Set = syBookshelf.Collection.extend({
	model: Followship
});
