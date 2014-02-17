var path = require('path'),
	Promise = require('bluebird'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	errors = require('../lib/errors'),
	requireFn = require('../lib/requireFn'),
	User = requireFn('./user'),
	config = require('../config'),
	Photo, Photos;

Photo = module.exports = syBookshelf.Model.extend({
	tableName: 'photos',
	fields: [
		'id', 'userid', 'description', 'posttime'
	],
	omitInJSON: ['userid'],
	appended: ['user'],
	fieldToAssets: { image: 'photos' },

	defaults: function () {
		return {
			description: '',
			posttime: new Date()
		};
	},
	user: function () {
		return this.belongsTo(User(), 'userid');
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
		return path.join(config.assets[type].dir, '' + this.get('userid'), this.getAssetName(type));
	}
}, {
	randomForge: function () {
		return Photo.forge({
			description: chance.sentence(),
			posttime: chance.date({ year: 2013 })
		});
	}
});

Photos = Photo.Set = syBookshelf.Collection.extend({
	model: Photo
}, {
	lister: function (qb, query) {
		this.qbWhere(qb, query, ['id', 'userid']);
		if (query['fuzzy']) {
			this.qbWhereLike(qb, query, ['description']);
		}
	}
});
