var _ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	errors = require('../lib/errors'),
	encrypt = require('../lib/encrypt'),
	syBookshelf = require('./base'),
	UserProfile = require('./user-profile'),
	Followship = require('./followship'),
	FollowshipSet = Followship.Set,
	Issue = require('./issue'),
	Issues = Issue.Set,
	Photo = require('./photo'),
	Photos = Photo.Set,
	Starship = require('./starship'),
	StarshipSet = Starship.Set,
	Event = require('./event'),
	Events = Event.Set,
	config = require('../config'),
	Group = require('./group'),
	Activity = require('./activity'),
	Cooperation = require('./cooperation'),
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
	withRelated: ['profile'],
	required: ['username', 'password'],
	validators: {
		/*username: function (v) {
		 if (!/^[a-z][a-z0-9_\-\.]{2,16}[a-z0-9]$/i.test(v)) {
		 return errors[21310];
		 }
		 },
		 password: function (v) {
		 if (!this.hasChanged('password')) return;
		 if (!/^\w{6,18}$/i.test(v)) {
		 return errors[21311];
		 }
		 }*/
	},
	fieldToAssets: {
		avatar: 'avatars', cover: 'covers'
	},

	defaults: function () {
		return {
			isonline: 0,
			regtime: new Date()
		};
	},
	profile: function () {
		return this.hasOne(UserProfile, 'userid');
	},
	following: function () {
		return this.hasMany(Followship, 'userid');
	},
	followers: function () {
		return this.hasMany(Followship, 'followid');
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
	starring: function () {
		return this.hasMany(Starship, 'userid');
	},
	events: function () {
		return this.hasMany(Event, 'userid');
	},
	activities: function () {
		return this.belongsToMany(Activity, 'user_activity', 'userid', 'activityid');
	},
	cooperations: function () {
		return this.belongsToMany(Cooperation, 'user_cooperation', 'userid', 'cooperationid');
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
			}, function (err) {
				// rollback
				return self.destroy()
					.then(function () {
						return Promise.reject(err);
					});
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

	fetch: function (options) {
		return User.__super__.fetch.call(this, options)
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
		return FollowshipSet.forge().query()
			.where('userid', '=', self.id)
			.count('id')
			.then(function (d) {
				self.data('numFollowing', d[0]["count(`id`)"]);
			}).then(function () {
				return FollowshipSet.forge().query()
					.where('followid', '=', self.id)
					.count('id')
			}).then(function (d) {
				return self.data('numFollowers', d[0]["count(`id`)"]);
			});
	},
	countIssues: function () {
		var self = this;
		return Issues.forge().query()
			.where('userid', '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numIssues', d[0]["count(`id`)"]);
			});
	},
	countPhotos: function () {
		var self = this;
		return Photos.forge().query()
			.where('userid', '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numPhotos', d[0]["count(`id`)"]);
			});
	},
	countStarship: function () {
		var self = this;
		return StarshipSet.forge().query()
			.where('userid', '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numStarring', d[0]["count(`id`)"]);
			});
	},
	countEvents: function () {
		var self = this;
		return Events.forge().query()
			.where('userid', '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numEvents', d[0]["count(`id`)"]);
			});
	},

	register: function () {
		if (!this.data('profile')) {
			this.data('profile', this.get('profile') || {});
		}
		this.attributes = this.pick(['username', 'password', 'regtime', 'isonline']);
		var self = this;
		return self.save()
			.catch(function (err) {
				if (/^ER_DUP_ENTRY/.test(err.message)) {
					return Promise.reject(errors[20506]);
				}
				return Promise.reject(err);
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
			return Promise.reject(errors[10008]);
		}
		if (!encrypted) {
			// encrypt password
			loginData['password'] = encrypt(loginData['password']);
		}
		return User.forge(loginData).fetch()
			.then(function (user) {
				if (!user) return Promise.reject(errors[21302]);
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
				return Promise.reject(errors[21301])
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
	}
});

Users = User.Set = syBookshelf.Collection.extend({
	model: User,

	// ATTENTION:
	// this overwriting can not be left out in each Collection
	// DO NOT use `this` here, it is not the Collection
	fetch: function () {
		return Users.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch')
					.then(function(){
						return collection;
					});
			});
	}
}, {
	finder: function (qb, query) {
		query['profile'] = query['profile'] || {};
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
	},

	searcher: function (qb, query) {
		query['profile'] = query['profile'] || {};
		var count = 0;
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
		if (count < 1) query['limit'] = 0;
	}
});
