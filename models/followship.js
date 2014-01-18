var _ = require('underscore'),
	Promise = require('bluebird'),
	syBookshelf = require('./base'),
	errors = require('../lib/errors'),
	Followship, FollowshipSet;

Followship = module.exports = syBookshelf.Model.extend({
	tableName: 'user_followship',
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
	lookup: function (query) {
		return Followship.forge(
			_.pick(query, ['userid', 'followid'])
		).fetch();
	},

	follow: function (query) {
		return this.lookup(query)
			.then(function (followship) {
				if (followship) {
					return Promise.rejected(errors[20506]);
				}
				followship = Followship.forge(query);
				return followship.user().fetch()
					.then(function (user) {
						if (!user) return Promise.rejected(errors[20003]);
						return followship.save();
					});
			});
	},
	unfollow: function (query) {
		return this.lookup(query)
			.then(function (followship) {
				if (!followship) {
					return Promise.rejected(errors[20603]);
				}
				return followship.destroy();
			});
	},

	remark: function (query) {
		return this.lookup(query)
			.then(function (followship) {
				if (!followship) {
					return Promise.rejected(errors[20603]);
				}
				return followship.set(
					_.pick(query, 'remark')
				).save();
			});
	}
});

FollowshipSet = Followship.Set = syBookshelf.Collection.extend({
	model: Followship
});
