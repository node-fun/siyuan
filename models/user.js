var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserProfile = require('./user-profile'),
	fkProfile = 'userid',
	User, Users;

User = module.exports = syBookshelf.Model.extend({
	tableName: 'users',
	fields: ['id', 'username', 'password', 'regtime', 'isonline'],

	initialize: function () {
		return User.__super__
			.initialize.apply(this, arguments);
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
		// fix lower case
		this.fixLowerCase(['username']);
		return ret;
	},

	toJSON: function () {
		var attrs = User.__super__
			.toJSON.apply(this, arguments);
		attrs = _.omit(attrs, ['password']);
		return attrs;
	},

	profile: function () {
		return this.hasOne(UserProfile, fkProfile);
	}
}, {
	randomForge: function () {
		return User.forge({
			username: chance.word(),
			password: chance.string(),
			regtime: chance.date({year: 2013}),
			isonline: chance.bool()
		});
	},

	find: function (match, offset, limit) {
		var forUser = ['id', 'username', 'isonline'],
			forProfile = ['nickname', 'name', 'gender'],
			tbUser = User.prototype.tableName,
			tbProfile = UserProfile.prototype.tableName;
		return Users.forge()
			.query(function (qb) {
				// FIXME: so dirty, with lots of Coupling here
				qb.join(tbProfile, tbProfile + '.' + fkProfile,
					'=', tbUser + '.id');
				_.each(forUser, function (k) {
					if (k in match) {
						qb.where(tbUser + '.' + k, match[k]);
					}
				});
				_.each(forProfile, function (k) {
					if (k in match) {
						qb.where(tbProfile + '.' + k, match[k]);
					}
				});
			}).query('offset', offset)
			.query('limit', limit)
			.fetch();
	},

	search: function (match, offset, limit) {
		var forUser = ['username'],
			forProfile = ['nickname', 'name'],
			tbUser = User.prototype.tableName,
			tbProfile = UserProfile.prototype.tableName,
			count = 0;
		return Users.forge()
			.query(function (qb) {
				qb.join(tbProfile, tbProfile + '.' + fkProfile,
					'=', tbUser + '.id');
				_.each(forUser, function (k) {
					if (k in match) {
						count++;
						qb.where(tbUser + '.' + k, 'like', '%' + match[k] + '%');
					}
				});
				_.each(forProfile, function (k) {
					if (k in match) {
						count++;
						qb.where(tbProfile + '.' + k, 'like', '%' + match[k] + '%');
					}
				});
			}).query('offset', offset)
			.query('limit', count ? limit : 0)
			.fetch();
	},

	view: function (id) {
		return User.forge({id: id})
			.fetch({
				withRelated: ['profile']
			}).then(function (user) {
				if (user) {
					// append `profile`
					user.attributes['profile'] = user.related('profile');
				}
				return user;
			});
	}
});

Users = User.Collection = syBookshelf.Collection.extend({
	model: User
});
