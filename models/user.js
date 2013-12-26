var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	User, Users;

User = module.exports = syBookshelf.Model.extend({
	tableName: 'users',
	fields: ['id', 'username', 'password', 'regtime', 'isonline'],

	initialize: function () {
		return User.__super__.initialize.apply(this, arguments);
	},

	saving: function () {
		var ret = User.__super__
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
	randomForge: function () {
		return User.forge({
			username: chance.word(),
			password: chance.string(),
			regtime: chance.date(),
			isonline: chance.bool()
		});
	},

	find: function (match, offset, limit) {
		var accepts = ['id', 'username', 'email', 'isonline'];
		return Users.forge().query(function (qb) {
			_.each(accepts, function (k) {
				if (k in match) {
					qb.where(k, '=', match[k]);
				}
			});
		}).query('offset', offset)
			.query('limit', limit)
			.fetch();
	},

	search: function (match, offset, limit) {
		var accepts = ['username'];
		return Users.forge().query(function (qb) {
			_.each(accepts, function (k) {
				if (k in match) {
					qb.where(k, 'like', '%' + match[k] + '%');
				}
			});
		}).query('offset', offset)
			.query('limit', limit)
			.fetch();
	}
});

Users = User.Collection = syBookshelf.Collection.extend({
	model: User
});
