var syBookshelf = require('./base'),
	Followship, FollowshipSet;

Followship = module.exports = syBookshelf.Model.extend({
	tableName: 'followship',
	fields: [
		'id', 'userid', 'followid', 'remark'
	],
	omitInJSON: ['id', 'userid', 'followid'],
	appended: ['user', 'followee'],

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	},
	followee: function () {
		return this.belongsTo(require('./user'), 'followid');
	}
}, {

});

FollowshipSet = Followship.Set = syBookshelf.Collection.extend({
	model: Followship
}, {
	finderFollowing: function (qb, query) {
		['userid'].forEach(function (k) {
			if (k in query) {
				qb.where(k, query[k]);
			}
		});
	},
	finderFollowers: function (qb, query) {
		['followid'].forEach(function (k) {
			if (k in query) {
				qb.where(k, query[k]);
			}
		});
	}
});
