var path = require('path'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
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
		return this.belongsTo(require('./user'), 'userid');
	},

	created: function (model) {
		return Photo.__super__.created.call(this)
			.then(function () {
				return model.updateAsset('image', model.data('image'));
			});
	},
	destroying: function (model) {
		return Photo.__super__.destroying.call(this)
			.then(function () {
				return model.deleteAsset('image');
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
	model: Photo,

	lister: function (req, qb) {
		this.qbWhere(qb, req, req.query, ['id', 'userid']);
		if (req.query['fuzzy']) {
			this.qbWhereLike(qb, req, req.query, ['description']);
		}
	}
});
