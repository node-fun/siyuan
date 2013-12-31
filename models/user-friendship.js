var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserFriendship, UserFriendshipSet;

UserFriendship = module.exports = syBookshelf.Model.extend({
	tableName: 'user_friendship',
	fields: [
		'id', 'userid', 'friendid', 'markname'
	],
	omitInJSON: ['id', 'userid']
}, {
	getFriendship: function (from, to) {
		return UserFriendship.forge({
			userid: from,
			friendid: to
		}).fetch();
	},

	addFriendship: function (from, to, markname) {
		return this.getFriendship(from, to)
			.then(function (friendship) {
				if (friendship) {
					return friendship.set({
						markname: markname
					}).save();
				}
				return UserFriendship.forge({
					userid: from,
					friendid: to,
					markname: markname
				}).save();
			});
	}
});

UserFriendshipSet = UserFriendship.Collection = syBookshelf.Collection.extend({
	model: UserFriendship
});
