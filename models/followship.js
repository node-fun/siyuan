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

});

FollowshipSet = Followship.Set = syBookshelf.Collection.extend({
	model: Followship,

	fetch: function () {
		return FollowshipSet.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch');
			});
	}
}, {
	finderFollowing: function (qb, query, related) {
		['userid'].forEach(function (k) {
			if (k in query) {
				qb.where(k, query[k]);
			}
		});
		related.push('followee.profile');
	},
	finderFollowers: function (qb, query, related) {
		['followid'].forEach(function (k) {
			if (k in query) {
				qb.where(k, query[k]);
			}
		});
		related.push('user.profile');
	}
});
