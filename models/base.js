var _ = require('underscore'),
	Bookshelf = require('bookshelf'),
	config = require('../config/'),
	dbConfig = config.db,
	syBookshelf = module.exports = Bookshelf.initialize(dbConfig),
	syModel = syBookshelf.Model,
	syCollection = syBookshelf.Collection;

syModel = syModel.extend({
	// TODO
	// see Ghost as reference
	tableName: ''
}, {

});

syCollection = syCollection.extend({
	// for prototype
	model: syModel
}, {
	// for static
	model: syModel
});
