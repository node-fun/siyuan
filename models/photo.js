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
	withRelated: ['user.profile'],
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
	finder: function (qb, query) {
		['id', 'userid'].forEach(function (k) {
			if (k in query) {
				qb.where(k, query[k]);
			}
		});
	},

	searcher: function (qb, query) {
		var count = 0;
		['userid'].forEach(function (k) {
			if (k in query) {
				count++;
				qb.where(k, query[k]);
			}
		});
		['description'].forEach(function (k) {
			if (k in query) {
				count++;
				qb.where(k, 'like', '%' + query[k] + '%');
			}
		});
		if (count < 1) query['limit'] = 0;
	}
});
