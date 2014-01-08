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

	initialize: function () {
		return Admin.__super__.initialize.apply(this, arguments);
	},

	saving: function () {
		var ret = Admin.__super__.saving.apply(this, arguments);
		if (this.isNew())
		//append 'regtime'
			if (!this.get('regtime')) {
				this.set({
					'regtime': new Date()
				});
			}
		//fix lower case
		this.fixLowerCase(['username']);
		return ret;
	},
	login: function () {
		var keys = ['username', 'password'],
			loginData = this.pick(keys);
		if (!_.all(keys, function (key) {
			return loginData[key];
		})) {
			return Promise.rejected(errors[10008]);
		}
		//not encrypted yet
		return Admin.forge(loginData).fetch()
			.then(function (admin) {
				if (!admin) return Promise.rejected(errors[21302]);
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
			//not encrypted yet
			if (oldPassword != self.get('password')) {
				return Promise.rejected(errors[21301]);
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

	find: function (match, offset, limit) {
		var forAdmin = ['id', 'username'];
		return Admins.forge()
			.query(function (qb) {
				_.each(forAdmin, function (k) {
					if (k in match) {
						qb.where(k, '=', match[k]);
					}
				})
			})
			.query('offset', offset)
			.query('limit', limit)
			.fetch();
	},
	search: function (match, offset, limit) {
		var accepts = ['username'],
			count = 0;
		return Admins.forge()
			.query(function (qb) {
				_.each(accepts, function (k) {
					if (k in match) {
						count++;
						qb.where(k, 'like', '%' + match[k] + '%');
					}
				});
			}).query('offset', offset)
			.query('limit', count ? limit : 0)
			.fetch();
	},
	view: function (id) {
		return Admin.forge({id: id})
			.fetch()
			.then(function (admin) {
				return admin;
			});
	}
});

Admins = Admin.Set = syBookshelf.Collection.extend({
	model: Admin
});