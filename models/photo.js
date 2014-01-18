var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	Photo, Photos;

Photo = module.exports = syBookshelf.Model.extend({
	tableName: 'photos',
	fields: [
		'id', 'userid', 'description', 'posttime'
	],

	defaults: function () {
		return {
			description: '',
			posttime: new Date()
		};
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
});
