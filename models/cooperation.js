/**
 * Created by cin on 1/18/14.
 */
/**
 * Created by cin on 1/18/14.
 */
var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	errors = require('../lib/errors'),
	syBookshelf = require('./base'),
	User = require('./user'),
	CoStatus = require('./co-status'),
	UserCooperation = require('./user-cooperation'),
	UserCooperations = UserCooperation.Set,
	GroupMember = require('./group-membership'),
	CoComment = require('./co-comment'),
	CoComments = CoComment.Set,
	Cooperation, Cooperations,
	config = require('../config'),
	avatarDir = config.assets.cooperations.dir,
	avatarExt = config.avatarExt,
	fkStatus = 'statusid',
	fkCooperation = 'cooperationid',
	fkOwner = 'ownerid';

Cooperation = module.exports = syBookshelf.Model.extend({
	tableName: 'cooperations',
	fields: [
		'id', 'name', 'description', 'company', 'avatar', 'statusid', 'ownerid', 'isprivate', 'regdeadline'
	],

	withRelated: ['user.profile', 'status'],
	fieldToAssets: { avatar: 'cooperations' },

	toJSON: function () {
		var self = this, Model = this.constructor,
			ret = Model.__super__.toJSON.apply(this, arguments);
		_.each(this.fieldToAssets, function (type, field) {
			if (self.get(field) != null) {
				var file = self.getAssetPath(type);
				ret[field] = config.toStaticURI(file) + '?t=' + ret[field];
			}
		});
		return ret;
	},

	saving: function () {
		return Cooperation.__super__
			.saving.apply(this, arguments);
	},

	usership: function () {
		return this.hasMany(UserCooperations, fkCooperation);
	},

	fetch: function () {
		return Cooperation.__super__.fetch.apply(this, arguments)
			.then(function (cooperation) {
				if (!cooperation) return cooperation;
				return cooperation.countComments();
			});
	},

	countUsership: function () {
		var self = this;
		UserCooperations.forge().query()
			.where(fkCooperation, '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numUsership', d[0]["count(`id`)"]);
			});
	},

	status: function () {
		return this.belongsTo(CoStatus, fkStatus);
	},
	user: function () {
		return this.belongsTo(User, fkOwner);
	},

	cocomments: function () {
		return this.hasMany(CoComment, 'cooperationid');
	},

	countComments: function () {
		var self = this;
		return this.cocomments().fetch()
			.then(function (cocomments) {
				var numComments = cocomments.length;
				return self.data('numComments', numComments);
			});
	}
}, {
	randomForge: function () {
		var status = _.random(1, 2);
		return Cooperation.forge({
			'name': chance.word(),
			'description': chance.paragraph(),
			'ownerid': chance.integer({
				min: 1,
				max: 20
			}),
			'company': chance.word(),
			'avatar': chance.word(),
			'statusid': status,
			'isprivate': chance.bool(),
			'regdeadline': chance.date({ year: 2013 })
		});
	},

	find: function (query) {
		var forCooperation = ['id', 'name', 'company', 'statusid'],
			cooperations = Cooperations.forge();
		return cooperations
			.query(function (qb) {
				_.each(forCooperation, function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query(function (qb) {
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	},

	search: function (query) {
		var count = 0;
		return Cooperations.forge()
			.query(function (qb) {
				['name', 'description'].forEach(function (k) {
					if (k in query) {
						count++;
						qb.where(k, query[k]);
					}
				});
				['ownerid'].forEach(function (k) {
					if (k in query) {
						count++;
						qb.where(k, 'like', '%' + query[k] + '%');
					}
				});
			}).query(function (qb) {
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', count ? query['limit'] : 0)
			.fetch();
	},

	view: function (query) {
		return Cooperation.forge({ id: query['id'] })
			.fetch().then(function (cooperation) {
				if (!cooperation) return Promise.rejected(errors[20603]);
				//return cooperation.load(['cocomments', 'user', 'user.profile']);
				return CoComments.forge()
					.query('where', 'cooperationid', '=', cooperation.get('id'))
					.query('orderBy', 'id', 'desc')
					.fetch().then(function (cocomments) {
						return cooperation.set('cocomments', cocomments);
					})
			});
	}
});

Cooperations = Cooperation.Set = syBookshelf.Collection.extend({
	model: Cooperation,

	fetch: function () {
		return Cooperations.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch')
					.then(function(){
						return collection;
					});
			});
	}
});