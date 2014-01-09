var fs = require('fs'),
	path = require('path'),
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
	avatarExt = 'jpg',
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
		// fix lower case
		this.fixLowerCase(['username']);
		if (this.isNew()) {
			// append `regtime`
			if (!this.has('regtime')) {
				this.set({
					'regtime': new Date()
				});
			}
		}
		if (this.hasChanged('password')) {
			// encrypt password
			this.set('password', encrypt(this.get('password')));
		}
		return ret;
	},

	toJSON: function () {
		var ret = User.__super__
			.toJSON.apply(this, arguments);
		// append avatar
		if (this.id) {
			ret['avatar'] = User.getAvatarURI(this.id);
		}
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
			.through(UserFriendship, 'id', fkUser);
	},

	register: function () {
		var keys = ['username', 'password'],
			registerData = this.pick(keys),
			self = this;
		if (!_.all(keys, function (key) {
			return registerData[key];
		})) {
			return Promise.rejected(errors[10008]);
		}
		return User.forge(_.pick(registerData, 'username')).fetch()
			.then(function (user) {
				if (user) return Promise.rejected(errors[30010]);
				var profileData = self.get('profile'),
					profile = UserProfile.forge(profileData);
				return User.forge(registerData).save()
					.then(function (user) {
						return profile.set(fkUser, user.id).save()
							.then(function (user) {
								if (!user) return Promise.rejected(errors[21300]);
								self.set('id', user.id);
								return self.load(['profile']);
							});
					});
			});
	},
	login: function (encrypted) {
		var keys = ['username', 'password'],
			loginData = this.pick(keys);
		if (!_.all(keys, function (key) {
			return loginData[key];
		})) {
			return Promise.rejected(errors[10008]);
		}
		if (!encrypted) {
			// encrypt password
			loginData['password'] = encrypt(loginData['password']);
		}
		return User.forge(loginData).fetch()
			.then(function (user) {
				if (!user) return Promise.rejected(errors[21302]);
				return user.set('isonline', 1).save();
			});
	},
	logout: function () {
		return this.fetch().then(function (user) {
			return user.set('isonline', 0).save();
		});
	},

	resetPassword: function (data) {
		var oldPassword = data['password'],
			newPassword = data['new-password'],
			self = this;
		return this.fetch().then(function () {
			if (encrypt(oldPassword) != self.get('password')) {
				return Promise.rejected(errors[21301])
			}
			return self.set('password', newPassword).save();
		});
	},
	updateProfile: function (data) {
		var self = this;
		return this.profile().fetch()
			.then(function (profile) {
				return profile.set(data).save();
			}).then(function () {
				return self;
			});
	},
	updateAvatar: function (tmp) {
		var file = User.getAvatarPath(this.id),
			self = this;
		return new Promise(function (resolve, reject) {
			fs.rename(tmp, file, function (err) {
				if (err) return reject(errors[30001]);
				resolve(self);
			});
		});
	},

	addFriend: function (friendid, remark) {
		var self = this;
		return UserFriendship.addFriendship(this.id, friendid, remark)
			.then(function () {
				return self;
			});
	},
	removeFriend: function (friendid) {
		var self = this;
		return UserFriendship.removeFriendship(this.id, friendid)
			.then(function () {
				return self;
			});
	},
	remarkFriend: function (friendid, remark) {
		var self = this;
		return UserFriendship.remark(this.id, friendid, remark)
			.then(function () {
				return self;
			});
	}
}, {
	randomForge: function () {
		return User
			.forge({
				//username: 'same username',
				username: chance.word() + '_' + _.random(0, 99),
				password: chance.string(),
				regtime: chance.date({ year: 2013 }),
				isonline: chance.bool()
			}).set('profile', UserProfile.randomForge().attributes);
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
			.fetch().then(function (users) {
				return users.length ? users.load(['profile']) : users;
			});
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
				if ('isonline' in match) {
					count++;
					qb.where('isonline', match['isonline']);
				}
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
			.fetch().then(function (users) {
				return users.length ? users.load(['profile']) : users;
			});
	},

	view: function (id) {
		return User.forge({ id: id })
			.fetch()
			.then(function (user) {
				if (!user) return Promise.rejected(errors[20003]);
				return user.load(['profile', 'friendship']);
			});
	},

	getAvatarName: function (id) {
		return id + '.' + avatarExt;
	},
	getAvatarPath: function (id) {
		return path.join(avatarDir, User.getAvatarName(id));
	},
	getAvatarURI: function (id) {
		return '/avatars/' + User.getAvatarName(id);
	}
});

Users = User.Set = syBookshelf.Collection.extend({
	model: User
});
