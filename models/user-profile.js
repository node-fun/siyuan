var _ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	errors = require('../lib/errors'),
	syBookshelf = require('./base'),
	UserProfile, UserProfiles;

UserProfile = module.exports = syBookshelf.Model.extend({
	tableName: 'user_profiles',
	fields: [
		'id', 'userid', 'email', 'name', 'gender',
		'age', 'grade', 'university', 'major', 'summary',
		'tag'
	],
	omitInJSON: ['id', 'userid'],
	required: ['name'],
	validators: {
		email: function (v) {
			if (!/^[a-z]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?$/i.test(v)) {
				return errors[21312];
			}
		}
	},

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
			summary: chance.sentence(),
			tag: chance.word() + ',' + chance.word() + ',' + chance.word()
		});
	}
});

UserProfiles = UserProfile.Set = syBookshelf.Collection.extend({
	model: UserProfile
});
