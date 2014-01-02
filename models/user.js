var fs = require('fs'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	errors = require('../lib/errors'),
	encrypt = require('../lib/encrypt'),
	syBookshelf = require('./base'),
	UserProfile = require('./user-profile'),
	UserFriendship = require('./user-friendship'),
	config = require('../config'),
	avatarDir = config.avatarDir,
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
		var ret = User.__super__
			.saving.apply(this, arguments);
		if (this.isNew()) {
			// append `regtime`
			if (!this.has('regtime')) {
				this.set({
					'regtime': new Date()
				});
			}
		}
		if (this.hasChanged('password')) {
			// encrypt password before saving
			this.set({
				password: encrypt(this.get('password'))
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
			profile = UserProfile.forge(profileData),
			registerData = this.pick(['username', 'password']);
		return User.forge(registerData).save()
			.then(function (user) {
				return profile.set(fkUser, user.id)
					.save().then(function (user) {
						if (!user) throw errors[21300];
						return user;
					});
			});
	},
	login: function () {
		var loginData = this.pick(['username', 'password']);
		// encrypt password before matching
		loginData.password = encrypt(loginData.password);
		return User.forge(loginData).fetch()
			.then(function (user) {
				if (!user) throw errors[21302];
				return user.set({ isonline: 1 }).save();
			});
	},
	logout: function () {
		return this.fetch().then(function (user) {
			if (!user) throw errors[21301];
			return user.set({ isonline: 0 }).save();
		});
	},

	resetPassword: function (data) {
		var oldPassword = data['password'],
			newPassword = data['new-password'],
			self = this;
		return this.fetch().then(function () {
			if (encrypt(oldPassword) != self.get('password'))
				throw errors[21301];
			return self.set('password', newPassword).save();
		});
	},
	updateProfile: function (data) {
		var self = this;
		return this.profile().fetch().then(function (profile) {
			return profile.set(data).save().then(function () {
				return self;
			});
		});
	},
	updateAvatar: function (tmp, ext) {
		ext = ext || 'jpg';
		var file = avatarDir + '/' + this.id + '.' + ext,
			self = this;
		return new Promise(function (resolve, reject) {
			fs.rename(tmp, file, function (err) {
				if (err) return reject(errors[30001]);
				resolve(self);
			});
		});
	},

	addFriend: function (userid, remark) {
		var self = this;
		return UserFriendship.addFriendship(this.id, userid, remark)
			.then(function () {
				return self;
			});
	}
}, {
	randomForge: function () {
		return User
			.forge({
				username: chance.word(),
				password: chance.string(),
				regtime: chance.date({ year: 2013 }),
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
		return User.forge({ id: id })
			.fetch()
			.then(function (user) {
				if (!user) throw errors[20003];
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
