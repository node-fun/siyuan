var _ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	syBookshelf = require('./base'),
	UserFriendship, UserFriendshipSet;

UserFriendship = module.exports = syBookshelf.Model.extend({
	tableName: 'user_friendship',
	fields: [
		'id', 'userid', 'friendid', 'remark'
	],
	omitInJSON: ['id', 'userid']
}, {
	getFriendship: function (from, to) {
		return UserFriendship.forge({
			userid: from,
			friendid: to
		}).fetch();
	},

	addFriendship: function (from, to, remark) {
		return this.getFriendship(from, to)
			.then(function (friendship) {
				if (friendship) {
					return Promise.rejected(errors[20506]);
				}
				return UserFriendship.forge({
					userid: from,
					friendid: to,
					remark: remark
				}).save();
			});
	},
	removeFriendship: function (from, to) {
		return this.getFriendship(from, to)
			.then(function (friendship) {
				if (!friendship) {
					return Promise.rejected(errors[20522]);
				}
				return friendship.destroy();
			});
	},

	remark: function (from, to, remark) {
		return this.getFriendship(from, to)
			.then(function (friendship) {
				if (!friendship) {
					return Promise.rejected(errors[20522]);
				}
				return friendship.set('remark', remark).save();
			});
	}
});

UserFriendshipSet = UserFriendship.Set = syBookshelf.Collection.extend({
	model: UserFriendship
});
