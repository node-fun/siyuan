var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	User, Users;

User = syBookshelf.Model.extend({
	tableName: 'users',
	permittedAttrs: ['id', 'username', 'password', 'email', 'regtime'],

	initialize: function () {
		return this.constructor.__super__
			.saving.apply(this, arguments);
	},

	saving: function () {
		var ret = this.constructor.__super__
			.saving.apply(this, arguments);
		// append `regtime`
		if (!this.get('regtime')) {
			this.set({
				'regtime': new Date()
			});
		}
		return ret;
	}
}, {
	createRandom: function () {
		return this.forge({
			username: chance.word(),
			password: chance.string(),
			regtime: chance.date(),
			isonline: chance.bool()
		});
	}
});

Users = module.exports = syBookshelf.Collection.extend({
	model: User
});
