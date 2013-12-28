var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserProfile, UserProfiles;

UserProfile = module.exports = syBookshelf.Model.extend({
	tableName: 'user_profiles',
	fields: [
		'id', 'userid', 'email', 'nickname', 'name', 'gender',
		'age', 'grade', 'university', 'major'
	],

	ranges: {
		gender: [null, 'm', 'f']
	},

	initialize: function () {
		return UserProfile.__super__
			.initialize.apply(this, arguments);
	},

	saving: function () {
		var ret = UserProfile.__super__
			.saving.apply(this, arguments);
		// fix lower case
		this.fixLowerCase(['email', 'gender']);
		// fix range
		this.fixRange('gender', this.ranges.gender);
		return ret;
	},

	toJSON: function () {
		var attrs = UserProfile.__super__
			.toJSON.apply(this, arguments);
		attrs = _.omit(attrs, ['id', 'userid']);
		return attrs;
	}
}, {
	randomForge: function () {
		return UserProfile.forge({
			email: chance.email(),
			nickname: chance.name(),
			name: chance.name(),
			gender: _.sample(['m', 'f']),
			age: _.random(20, 60),
			grade: _.random(2013, 1973),
			university: chance.city() + ' University',
			major: chance.capitalize(chance.word())
		});
	}
});

UserProfiles = UserProfile.Collection = syBookshelf.Collection.extend({
	model: UserProfile
});
