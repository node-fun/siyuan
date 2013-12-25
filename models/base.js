var _ = require('underscore'),
	Bookshelf = require('bookshelf'),
	config = require('../config/'),
	dbConfig = config.db,
	syBookshelf = module.exports = Bookshelf.initialize(dbConfig),
	syModel = syBookshelf.Model,
	syCollection = syBookshelf.Collection;

syModel = syBookshelf.Model = syModel.extend({
	tableName: '',
	fields: [],

	initialize: function () {
		this.on('saving', this.saving, this);
	},

	saving: function () {
		this.attributes = this.pick(this.fields);
	},

	// Jayin needs Timestamp as Datetime
	forTimestamp: function (attrs) {
		_.each(attrs, function (val, key, list) {
			if (val instanceof Date) {
				list[key] = val.getTime();
			}
		});
		return attrs;
	},

	toJSON: function (options) {
		// clone
		var attrs = _.clone(this.attributes);
		// for timestamp
		attrs = this.forTimestamp(attrs);
		return attrs;
	}
}, {

});

syCollection = syModel.Collection = syCollection.extend({
	mode: syModel
});
