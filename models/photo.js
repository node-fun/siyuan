var path = require('path'),
	Promise = require('bluebird'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	errors = require('../lib/errors'),
	config = require('../config'),
	Photo, Photos;

Photo = module.exports = syBookshelf.Model.extend({
	tableName: 'photos',
	fields: [
		'id', 'userid', 'description', 'posttime'
	],
	omitInJSON: ['userid'],
	withRelated: ['user.profile'],
	fieldToAssets: { image: 'photos' },

	defaults: function () {
		return {
			description: '',
			posttime: new Date()
		};
	},
	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	},

	created: function () {
		var self = this;
		return Photo.__super__.created.call(self)
			.then(function () {
				return self.updateAsset('image', self.data('image'));
			});
	},
	destroying: function () {
		var self = this;
		return Photo.__super__.destroying.call(self)
			.then(function () {
				return self.deleteAsset('image');
			});
	},

	getAssetPath: function (type) {
		// don't miss the `''+` below
		return path.join(config.assets[type].dir, ''+this.get('userid'), this.getAssetName(type));
	}
}, {
	randomForge: function () {
		return Photo.forge({
			description: chance.sentence(),
			posttime: chance.date({ year: 2013 })
		});
	},

	find: function (query) {
		return Photos.forge()
			.query(function (qb) {
				['id', 'userid'].forEach(function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query(function(qb){
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	}
});

Photos = Photo.Set = syBookshelf.Collection.extend({
	model: Photo,

	fetch: function () {
		return Photos.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch');
			});
	}
});
