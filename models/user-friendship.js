var _ = require('underscore'),
	chance = new (require('chance'))(),
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
					return friendship.set('remark', remark).save();
				}
				return UserFriendship.forge({
					userid: from,
					friendid: to,
					remark: remark
				}).save();
			});
	}
});

UserFriendshipSet = UserFriendship.Set = syBookshelf.Collection.extend({
	model: UserFriendship
});
