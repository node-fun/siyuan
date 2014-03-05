/**
 * Created by cin on 1/18/14.
 */
/**
 * Created by cin on 1/18/14.
 */
var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	User = require('./user'),
	CoStatus = require('./co-status'),
	UserCooperation = require('./user-cooperation'),
	UserCooperations = UserCooperation.Set,
	Picture = require('./picture'),
	Pictures = Picture.Set,
	CoComment = require('./co-comment'),
	Cooperation, Cooperations,
	config = require('../config'),
	tbCooperation = 'cooperations',
	fkStatus = 'statusid',
	fkCooperation = 'cooperationid',
	fkOwner = 'ownerid';

Cooperation = module.exports = syBookshelf.Model.extend({
	tableName: tbCooperation,
	fields: [
		'id', 'name', 'description', 'company', 'avatar', 'statusid', 'ownerid', 'isprivate', 'regdeadline', 'createtime'
	],

	appended: ['user', 'status'],
	fieldToAssets: { avatar: 'cooperations' },

	defaults: function () {
		return {
			createtime: new Date()
		}
	},

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

	fetched: function (model, attrs, options) {
		return Cooperation.__super__.fetched.apply(this, arguments)
			.return(model)
			.call('countComments')
			.call('countUsership')
			.call('countPictures')
			.then(function (cooperation) {
				return model.related('pictures').fetch();
			})
			.then(function () {
				if (!options['detailed']) return;
				return model.related('cocomments')
					.query(function (qb) {
						qb.orderBy('id', 'desc');
					}).fetch();
			})
	},

	countUsership: function () {
		var self = this;
		return this.usership().fetch()
			.then(function (userships) {
				var numUserships = userships.length;
				return self.data('numUserships', numUserships);
			})
	},

	status: function () {
		return this.belongsTo(CoStatus, fkStatus);
	},
	user: function () {
		return this.belongsTo(require('./user'), fkOwner);
	},

	cocomments: function () {
		return this.hasMany(CoComment, 'cooperationid');
	},

	pictures: function () {
		return this.hasMany(Picture, 'cooperationid');
	},

	countComments: function () {
		var self = this;
		return this.cocomments().fetch()
			.then(function (cocomments) {
				var numComments = cocomments.length;
				return self.data('numComments', numComments);
			});
	},

	countPictures: function () {
		var self = this;
		return Pictures.forge().query()
			.where(fkCooperation, '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numPictures', d[0]["count(`id`)"]);
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
	}
});

Cooperations = Cooperation.Set = syBookshelf.Collection.extend({
	model: Cooperation,

	lister: function (req, qb) {
		var query = req.query;
		this.qbWhere(qb, req, query, ['id', 'statusid', 'ownerid', 'isprivate'], tbCooperation);
		if (!req.query['fuzzy']) {
			this.qbWhere(qb, req, query, ['name', 'company'], tbCooperation);
		} else {
			this.qbWhereLike(qb, req, query, ['name', 'description', 'company'], tbCooperation);
		}
	}
});
