var Promise = require('bluebird'),
	syBookshelf = require('./base'),
	errors = require('../lib/errors'),
	UserFriendship, UserFriendshipSet;

UserFriendship = module.exports = syBookshelf.Model.extend({
	tableName: 'user_friendship',
	fields: [
		'id', 'userid', 'friendid', 'remark'
	],
	omitInJSON: ['id', 'userid', 'friendid'],

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	},
	friend: function () {
		return this.belongsTo(require('./user'), 'friendid');
	}
}, {
	getFriendship: function (query) {
		return UserFriendship.forge(query).fetch();
	},

	addFriendship: function (query) {
		return this.getFriendship(query)
			.then(function (friendship) {
				if (friendship) {
					return Promise.rejected(errors[20506]);
				}
				return UserFriendship.forge(query).save();
			});
	},
	removeFriendship: function (query) {
		return this.getFriendship(query)
			.then(function (friendship) {
				if (!friendship) {
					return Promise.rejected(errors[20522]);
				}
				return friendship.destroy();
			});
	},

	remark: function (query) {
		return this.getFriendship(query)
			.then(function (friendship) {
				if (!friendship) {
					return Promise.rejected(errors[20522]);
				}
				return friendship.set(query).save();
			});
	}
});

UserFriendshipSet = UserFriendship.Set = syBookshelf.Collection.extend({
	model: UserFriendship
});
