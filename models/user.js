var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	errors = require('../lib/errors'),
	encrypt = require('../lib/encrypt'),
	syBookshelf = require('./base'),
	UserProfile = require('./user-profile'),
	Issue = require('./issue'),
	config = require('../config'),
	avatarDir = config.avatarDir,
	avatarExt = config.avatarExt,
	Group = require('./group'),
	User, Users;

User = module.exports = syBookshelf.Model.extend({
	tableName: 'users',
	fields: ['id', 'username', 'password', 'regtime', 'isonline'],
	omitInJSON: ['password'],

	defaults: function () {
		return {
			isonline: 0,
			regtime: new Date()
		};
	},
	toJSON: function () {
		var ret = User.__super__.toJSON.apply(this, arguments);
		// append avatar
		if (this.id) {
			ret['avatar'] = User.getAvatarURI(this.id);
		}
		return ret;
	},

	saving: function () {
		var self = this;
		return User.__super__.saving.call(self)
			.then(function () {
				// fix lower case
				self.fixLowerCase(['username']);
				if (self.hasChanged('password')) {
					// encrypt password
					self.set('password', encrypt(self.get('password')));
				}
				return self;
			});
	},

	fetch: function () {
		return User.__super__.fetch.apply(this, arguments)
			.then(function (user) {
				if (!user) return user;
				return user.load(['profile'])
					.then(function () {
						return user.countFollowship();
					}).then(function () {
						return user.countIssues();
					});
			});
	},

	profile: function () {
		return this.hasOne(UserProfile, 'userid');
	},
	following: function () {
		return this.hasMany(require('./followship'), 'userid');
	},
	followers: function () {
		return this.hasMany(require('./followship'), 'followid');
	},
	groups: function () {
		return this.belongsToMany(Group, 'group_membership', 'userid', 'groupid');
	},
	issues: function () {
		return this.hasMany(Issue, 'userid');
	},

	countFollowship: function () {
		var self = this;
		return self.following().fetch()
			.then(function (followees) {
				var numFollowing = followees.length;
				return self.set('numFollowing', numFollowing)
					.followers().fetch();
			}).then(function (followers) {
				var numFollowers = followers.length;
				return self.set('numFollowers', numFollowers);
			});
	},
	countIssues: function () {
		var self = this;
		return this.issues().query('orderBy', 'posttime', 'desc').fetch()
			.then(function (issues) {
				var numIssues = issues.length;
				return self.set('numIssues', numIssues)
					.set('lastIssue', issues.first());
			});
	},

	register: function () {
		var keys = ['username', 'password', 'regtime'],
			registerData = this.pick(keys),
			self = this;
		if (!registerData['username'] || !registerData['password']) {
			return Promise.rejected(errors[10008]);
		}
		var profileData = self.get('profile'),
			profile = UserProfile.forge(profileData);
		return User.forge(registerData).save()
			.catch(function () {
				return Promise.rejected(errors[20506]);
			}).then(function (user) {
				return profile.set('userid', user.id).save()
					.then(function () {
						return self.set('id', user.id);
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
			fs.readFile(tmp, function (err, data) {
				if (err) return reject(errors[30000]);
				fs.writeFile(file, data, function (err) {
					if (err) return reject(errors[30001]);
					resolve(self);
				});
			});
		});
	}
}, {
	randomForge: function () {
		return User
			.forge({
				username: chance.word() + '_' + _.random(0, 999),
				password: chance.string(),
				isonline: chance.bool(),
				regtime: chance.date({ year: 2013 })
			}).set('profile', UserProfile.randomForge().attributes);
	},

	find: function (query) {
		var forUser = ['id', 'username', 'isonline'],
			forProfile = ['email', 'name', 'gender'],
			tbUser = User.prototype.tableName,
			tbProfile = UserProfile.prototype.tableName;
		return Users.forge()
			.query(function (qb) {
				qb.join(tbProfile, tbProfile + '.' + 'userid',
					'=', tbUser + '.id');
				_.each(forUser, function (k) {
					if (k in query) {
						qb.where(tbUser + '.' + k, query[k]);
					}
				});
				_.each(forProfile, function (k) {
					if (k in query) {
						qb.where(tbProfile + '.' + k, query[k]);
					}
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	},

	search: function (query) {
		var forUser = ['username', 'email'],
			forProfile = ['nickname', 'name', 'university', 'major', 'gender'],
			forFind = ['isonline'],
			tbUser = User.prototype.tableName,
			tbProfile = UserProfile.prototype.tableName, count = 0;
		return Users.forge()
			.query(function (qb) {
				qb.join(tbProfile, tbProfile + '.' + 'userid',
					'=', tbUser + '.' + 'id');
				_.each(forFind, function (k) {
					if (k in query) {
						count++;
						qb.where(tbUser + '.' + k, query[k]);
					}
				});
				_.each(forUser, function (k) {
					if (k in query) {
						count++;
						qb.where(tbUser + '.' + k, 'like', '%' + query[k] + '%');
					}
				});
				_.each(forProfile, function (k) {
					if (k in query) {
						count++;
						qb.where(tbProfile + '.' + k, 'like', '%' + query[k] + '%');
					}
				});
			}).query('offset', query['offset'])
			.query('limit', count ? query['limit'] : 0)
			.fetch();
	},

	view: function (query) {
		return User.forge({ id: query['id'] }).fetch()
			.then(function (user) {
				if (!user) return Promise.rejected(errors[20003]);
				return user.load(['following.followee', 'followers.user']);
			});
	},

	getAvatarName: function (id) {
		return id + avatarExt;
	},
	getAvatarPath: function (id) {
		return path.join(avatarDir, User.getAvatarName(id));
	},
	getAvatarURI: function (id) {
		return '/avatars/' + User.getAvatarName(id);
	}
});

Users = User.Set = syBookshelf.Collection.extend({
	model: User,

	fetch: function () {
		return Users.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch');
			});
	}
});
