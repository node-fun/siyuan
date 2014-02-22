/**
 * Created by cin on 12/24/13.
 */
var _ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	errors = require('../lib/errors'),
	encrypt = require('../lib/encrypt'),
	syBookshelf = require('./base'),
	Admin, Admins;

Admin = module.exports = syBookshelf.Model.extend({
	tableName: 'admin',
	fields: ['id', 'username', 'password', 'email', 'regtime', 'lastip', 'lasttime'],
	omitInJSON: ['password'],

	defaults: function () {
		return {
			regtime: new Date()
		};
	},

	saving: function () {
		Admin.__super__.saving.call(this);
		//fix lower case
		this.fixLowerCase(['username']);
		if (this.hasChanged('password')) {
			// encrypt password
			this.set('password', encrypt(this.get('password')));
		}
	},
	login: function (encrypted) {
		var keys = ['username', 'password'],
			loginData = this.pick(keys);
		if (!_.all(keys, function (key) {
			return loginData[key];
		})) {
			return Promise.reject(errors(10008));
		}
		if (!encrypted) {
			// encrypt password
			loginData['password'] = encrypt(loginData['password']);
		}
		return Admin.forge(loginData).fetch()
			.then(function (admin) {
				if (!admin) throw errors(21302);
				return admin.set({
					'lastip': chance.ip(),
					'lasttime': new Date()
				}).save();
			});
	},
	logout: function () {
		return this.fetch();
	},

	resetPassword: function (data) {
		var oldPassword = data['password'],
			newPassword = data['new-password'],
			self = this;
		return this.fetch().then(function () {
			if (encrypt(oldPassword) != self.get('password')) {
				throw errors(21301);
			}
			return self.set('password', newPassword).save();
		});
	}
}, {
	randomForge: function () {
		return Admin.forge({
			username: chance.word(),
			password: chance.string(),
			email: chance.email(),
			regtime: chance.date(),
			lastip: chance.ip(),
			lasttime: chance.date()
		});
	},

	find: function (query) {
		var forAdmin = ['id', 'username'];
		return Admins.forge()
			.query(function (qb) {
				_.each(forAdmin, function (k) {
					if (k in query) {
						qb.where(k, '=', query[k]);
					}
				})
			})
			.query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	},
	search: function (query) {
		var accepts = ['username'],
			count = 0;
		return Admins.forge()
			.query(function (qb) {
				_.each(accepts, function (k) {
					if (k in query) {
						count++;
						qb.where(k, 'like', '%' + query[k] + '%');
					}
				});
			}).query('offset', query['offset'])
			.query('limit', count ? query['limit'] : 0)
			.fetch();
	},
	view: function (query) {
		return Admin.forge({ id: query['id'] })
			.fetch()
			.then(function (admin) {
				return admin;
			});
	}
});

Admins = Admin.Set = syBookshelf.Collection.extend({
	model: Admin
});
