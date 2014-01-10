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
	omitInJSON: ['id', 'userid'],

	saving: function () {
		var ret = UserProfile.__super__
			.saving.apply(this, arguments);
		// fix lower case
		this.fixLowerCase(['email', 'gender']);
		return ret;
	}
}, {
	randomForge: function () {
		var age = _.random(20, 60);
		return UserProfile.forge({
			email: chance.email(),
			nickname: chance.name(),
			name: chance.name(),
			gender: _.sample(['m', 'f']),
			age: age,
			grade: 2011 - age + 20 + _.random(-2, 2),
			university: chance.city() + ' University',
			major: chance.capitalize(chance.word())
		});
	}
});

UserProfiles = UserProfile.Set = syBookshelf.Collection.extend({
	model: UserProfile
});
