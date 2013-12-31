var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserProfile = require('./user-profile'),
	UserFriendship = require('./user-friendship'),
	fkUser = 'userid',
	fkFriend = 'friendid',
	User, Users;

User = module.exports = syBookshelf.Model.extend({
	tableName: 'users',
	fields: ['id', 'username', 'password', 'regtime', 'isonline'],
	omitInJSON: ['password'],

	defaults: {
		isonline: 0
	},

	saving: function () {
		var ret = this.constructor.__super__
			.saving.apply(this, arguments);
		// append `regtime`
		if (!this.has('regtime')) {
			this.set({
				'regtime': new Date()
			});
		}
		// fix lower case
		this.fixLowerCase(['username']);
		return ret;
	},

	profile: function () {
		return this.hasOne(UserProfile, fkUser);
	},
	friendship: function () {
		return this.hasMany(UserFriendship, fkUser);
	},
	friends: function () {
		return this.hasMany(User, fkFriend)
			.through(UserFriendship, 'id');
	},

	register: function () {
		var profileData = this.get('profile'),
			profile = UserProfile.forge(profileData);
		this.attributes = this.pick(['username', 'password']);
		return this.save()
			.then(function (user) {
				return profile.set(fkUser, user.id)
					.save().then(function () {
						return user;
					});
			});
	},
	login: function () {
		this.attributes = this.pick(['username', 'password']);
		return this.fetch()
			.then(function (user) {
				if (!user) return null;
				return user.set({ isonline: 1 }).save()
					.then(function () {
						return user;
					});
			});
	},
	logout: function () {
		return this.set({ isonline: 0 }).save();
	}
}, {
	randomForge: function () {
		return User
			.forge({
				username: chance.word(),
				password: chance.string(),
				regtime: chance.date({year: 2013}),
				isonline: chance.bool()
			}).set({
				profile: UserProfile.randomForge().attributes
			});
	},

	find: function (match, offset, limit) {
		var forUser = ['id', 'username', 'isonline'],
			forProfile = ['email', 'name', 'gender'],
			tbUser = User.prototype.tableName,
			tbProfile = UserProfile.prototype.tableName;
		return Users.forge()
			.query(function (qb) {
				// FIXME: so dirty, with lots of Coupling here
				qb.join(tbProfile, tbProfile + '.' + fkUser,
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
			forProfile = ['nickname', 'name', 'university', 'major'],
			tbUser = User.prototype.tableName,
			tbProfile = UserProfile.prototype.tableName,
			count = 0;
		return Users.forge()
			.query(function (qb) {
				qb.join(tbProfile, tbProfile + '.' + fkUser,
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
			.fetch()
			.then(function (user) {
				return user.load(['profile', 'friendship']);
			}).then(function (user) {
				// FIXME: temporary avatar picture
				var profile = user.related('profile'),
					gender = profile.get('gender');
				return user.set({
					avatar: [
						'http://api.randomuser.me/0.2/portraits',
						gender === 'f' ? 'women' : 'men',
						_.random(0, 60) + '.jpg'
					].join('/')
				});
			});
	}
});

Users = User.Set = syBookshelf.Collection.extend({
	model: User
});
