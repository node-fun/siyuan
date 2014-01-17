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

	saving: function () {
		var ret = User.__super__.saving.apply(this, arguments);
		// fix lower case
		this.fixLowerCase(['username']);
		if (this.hasChanged('password')) {
			// encrypt password
			this.set('password', encrypt(this.get('password')));
		}
		return ret;
	},

	toJSON: function () {
		var ret = User.__super__.toJSON.apply(this, arguments);
		// append avatar
		if (this.id) {
			ret['avatar'] = User.getAvatarURI(this.id);
		}
		return ret;
	},

	profile: function () {
		return this.hasOne(UserProfile, 'userid');
	},
	friendshipSet: function () {
		return this.hasMany(UserFriendship, 'userid');
	},
	issues: function () {
		return this.hasMany(Issue, 'userid');
	},

	countFriends: function () {
		var self = this;
		return this.friendshipSet().fetch()
			.then(function (friendshipSet) {
				var numFriends = friendshipSet.length;
				return self.set('numFriends', numFriends);
			});
	},
	countIssues: function () {
		var self = this;
		return this.issues().fetch()
			.then(function (issues) {
				var numIssues = issues.length;
				return self.set('numIssues', numIssues)
					.set('lastIssue', issues.at(numIssues - 1));
			});
	},
	fetchLastIssue: function () {
		var self = this;
		return Issue.forge({ userid: this.id })
			.query(function (qb) {
				qb.orderBy('posttime', 'desc');
			}).fetch()
			.then(function (issue) {
				return self.set('lastIssue', issue);
			});
	},

	fetch: function () {
		var ret = User.__super__.fetch.apply(this, arguments);
		return ret
			.then(function (user) {
				if (!user) return user;
				return user.load(['profile']);
			}).then(function (user) {
				if (!user) return user;
				return user.countFriends();
			}).then(function (user) {
				if (!user) return user;
				return user.countIssues();
			});
	},

	register: function () {
		var keys = ['username', 'password', 'regtime'],
			registerData = this.pick(keys),
			self = this;
		if (!registerData['username'] || !registerData['password']) {
			return Promise.rejected(errors[10008]);
		}
		return User.forge(_.pick(registerData, 'username')).fetch()
			.then(function (user) {
				if (user) return Promise.rejected(errors[20506]);
				var profileData = self.get('profile'),
					profile = UserProfile.forge(profileData);
				return User.forge(registerData).save()
					.then(function (user) {
						return profile.set('userid', user.id).save()
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
			fs.readFile(tmp, function (err, data) {
				if (err) return reject(errors[30000]);
				fs.writeFile(file, data, function (err) {
					if (err) return reject(errors[30001]);
					resolve(self);
				});
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
	},

	groups: function(){
		return this.belongsToMany(Group, 'group_membership', 'userid', 'groupid');
	}
}, {
	randomForge: function () {
		return User
			.forge({
				//username: 'same username',
				username: chance.word() + '_' + _.random(0, 99),
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
		return User.forge({ id: query['id'] })
			.fetch()
			.then(function (user) {
				if (!user) return Promise.rejected(errors[20003]);
				return user.load(['profile', 'friendshipSet.friend']);
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
		var ret = Users.__super__.fetch.apply(this, arguments);
		return ret
			.then(function (users) {
				if (!users.length) return users;
				return users.invokeThen('fetch')
					.then(function () {
						return users;
					});
			});
	}
});
