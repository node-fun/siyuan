var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserProfile, UserProfiles;

UserProfile = module.exports = syBookshelf.Model.extend({
	tableName: 'user_profiles',
	fields: [
		'id', 'userid', 'email', 'name', 'gender',
		'age', 'grade', 'university', 'major', 'summary'
	],
	omitInJSON: ['id', 'userid'],

	saving: function () {
		var self = this;
		return UserProfile.__super__.saving.call(self)
			.then(function () {
				// fix lower case
				self.fixLowerCase(['email', 'gender']);
				return self;
			});
	}
}, {
	randomForge: function () {
		var age = _.random(20, 60);
		return UserProfile.forge({
			email: chance.email(),
			name: chance.name(),
			gender: _.sample(['m', 'f']),
			age: age,
			grade: 2011 - age + 20 + _.random(-2, 2),
			university: chance.city() + ' University',
			major: chance.capitalize(chance.word()),
			summary: chance.sentence()
		});
	}
});

UserProfiles = UserProfile.Set = syBookshelf.Collection.extend({
	model: UserProfile
});
