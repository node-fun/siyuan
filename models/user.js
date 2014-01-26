var fs = require('fs-extra'),
	path = require('path'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	errors = require('../lib/errors'),
	encrypt = require('../lib/encrypt'),
	syBookshelf = require('./base'),
	UserProfile = require('./user-profile'),
	Issue = require('./issue'),
	Photo = require('./photo'),
	Starship = require('./starship'),
	Event = require('./event'),
	config = require('../config'),
	avatarDir = config.avatarDir,
	avatarExt = config.avatarExt,
	Group = require('./group'),
	tbUser = 'users',
	tbProfile = UserProfile.prototype.tableName,
	User, Users;

User = module.exports = syBookshelf.Model.extend({
	tableName: tbUser,
	fields: [
		'id', 'username', 'password', 'regtime',
		'isonline', 'avatar', 'cover'
	],
	omitInJSON: ['password'],

	defaults: function () {
		return {
			isonline: 0,
			regtime: new Date()
		};
	},
	toJSON: function () {
		var ret = User.__super__.toJSON.apply(this, arguments);
		// to avatar uri if exists
		if (this.get('avatar')) {
			ret['avatar'] = User.getAvatarURI(this.id);
		}
		return ret;
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
	photos: function () {
		return this.hasMany(Photo, 'userid');
	},
	staring: function () {
		return this.hasMany(Starship, 'userid');
	},
	events: function () {
		return this.hasMany(Event, 'userid');
	},

	created: function () {
		var self = this;
		return User.__super__.created.call(self)
			.then(function () {
				var profileData = self.data('profile'),
					profile = UserProfile.forge(profileData);
				return profile.set('userid', self.id).save();
			}).then(function () {
				return self;
			});
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
				return user.countFollowship()
					.then(function () {
						return user.countIssues();
					}).then(function () {
						return user.countPhotos();
					}).then(function () {
						return user.countStarship();
					}).then(function () {
						return user.countEvents();
					});
			});
	},

	countFollowship: function () {
		var self = this;
		return self.following().fetch()
			.then(function (followshipSet) {
				var numFollowing = followshipSet.length;
				return self.data('numFollowing', numFollowing)
					.followers().fetch();
			}).then(function (followshipSet) {
				var numFollowers = followshipSet.length;
				return self.data('numFollowers', numFollowers);
			});
	},
	countIssues: function () {
		var self = this;
		return this.issues().fetch()
			.then(function (issues) {
				var numIssues = issues.length;
				return self.data('numIssues', numIssues);
			});
	},
	countPhotos: function () {
		var self = this;
		return this.photos().fetch()
			.then(function (photos) {
				var numPhotos = photos.length;
				return self.data('numPhotos', numPhotos);
			});
	},
	countStarship: function () {
		var self = this;
		return this.staring().fetch()
			.then(function (starshipSet) {
				var numStarring = starshipSet.length;
				return self.data('numStarring', numStarring);
			});
	},
	countEvents: function () {
		var self = this;
		return this.events().fetch()
			.then(function (events) {
				var numEvents = events.length;
				return self.data('numEvents', numEvents);
			});
	},

	register: function () {
		var keys = ['username', 'password', 'regtime'],
			self = this;
		this.attributes = this.pick(keys);
		if (!this.get('username') || !this.get('password')) {
			return Promise.rejected(errors[10008]);
		}
		return self.save()
			.catch(function () {
				return Promise.rejected(errors[20506]);
			}).then(function () {
				return self.fetch();
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
		return new Promise(
			function (resolve, reject) {
				fs.copy(tmp, file, function (err) {
					if (err) return reject(errors[30003]);
					resolve();
				});
			}).then(function () {
				return self.set('avatar', self.id).save()
					.then(function () {
						return self;
					});
			}).catch(function (err) {
				return self.set('avatar', null).save()
					.then(function () {
						return Promise.rejected(err);
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
				regtime: chance.date({ year: 2013 }),
				avatar: null,
				cover: null
			}).data('profile', UserProfile.randomForge().attributes);
	},

	find: function (query) {
		query['profile'] = query['profile'] || {};
		return Users.forge()
			.query(function (qb) {
				qb.join(tbProfile, tbProfile + '.userid', '=', tbUser + '.id');
				// find for user
				['id', 'username', 'isonline'].forEach(function (k) {
					if (k in query) {
						qb.where(tbUser + '.' + k, '=', query[k]);
					}
				});
				// find for profile
				['name', 'gender'].forEach(function (k) {
					if (k in query['profile']) {
						qb.where(tbProfile + '.' + k, '=', query['profile'][k]);
					}
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch({
				withRelated: ['profile']
			});
	},

	search: function (query) {
		query['profile'] = query['profile'] || {};
		var count = 0;
		return Users.forge()
			.query(function (qb) {
				qb.join(tbProfile, tbProfile + '.userid', '=', tbUser + '.id');
				// find for user
				['isonline'].forEach(function (k) {
					if (k in query) {
						count++;
						qb.where(tbUser + '.' + k, '=', query[k]);
					}
				});
				// find for profile
				['gender'].forEach(function (k) {
					if (k in query['profile']) {
						count++;
						qb.where(tbProfile + '.' + k, '=', query['profile'][k]);
					}
				});
				// search for user
				['username'].forEach(function (k) {
					if (k in query) {
						count++;
						qb.where(tbUser + '.' + k, 'like', '%' + query[k] + '%');
					}
				});
				// search for profile
				['name', 'university', 'major', 'summary'].forEach(function (k) {
					if (k in query['profile']) {
						count++;
						qb.where(tbProfile + '.' + k, 'like', '%' + query['profile'][k] + '%');
					}
				});
			}).query('offset', query['offset'])
			.query('limit', count ? query['limit'] : 0)
			.fetch({
				withRelated: ['profile']
			});
	},

	view: function (query) {
		return User.forge({ id: query['id'] })
			.fetch({
				withRelated: ['profile']
			}).then(function (user) {
				if (!user) return Promise.rejected(errors[20003]);
				return user;
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
