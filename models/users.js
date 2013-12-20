var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	User, Users;

User = syBookshelf.Model.extend({
	tableName: 'users',

	initialize: function () {
		this.on('saving', this.saving, this);
	},

	saving: function () {
		if (!this.get('regtime')) {
			this.set({
				'regtime': new Date()
			});
		}
	},

	toJSON: function () {
		var attrs = _.clone(this.attributes);
		// to timestamp
		attrs.regtime = new Date(attrs.regtime).getTime();
		return attrs;
	}
}, {
	createRandomUser: function () {
		return User.forge({
			username: chance.word(),
			password: chance.string(),
			regtime: chance.date(),
			isonline: chance.bool()
		});
	}
});

Users = module.exports = syBookshelf.Collection.extend({
	model: User
}, {
	model: User
});
