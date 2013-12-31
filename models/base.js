var _ = require('underscore'),
	Bookshelf = require('bookshelf'),
	config = require('../config'),
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
			if (_.isDate(val)) {
				list[key] = val.getTime();
			}
		});
		return attrs;
	},

	fixLowerCase: function (keys) {
		var attrs = this.attributes;
		_.each(keys, function (k) {
			if (_.isString(attrs[k])) {
				attrs[k] = attrs[k].toLowerCase();
			}
		});
	},

	fixRange: function (key, range) {
		var attrs = this.attributes;
		if (!_.contains(range, attrs[key])) {
			attrs[key] = range[0];
		}
	},

	toJSON: function () {
		var attrs = syModel.__super__
			.toJSON.apply(this, arguments);
		// for timestamp
		attrs = this.forTimestamp(attrs);
		return attrs;
	}
}, {

});

syCollection = syModel.Collection = syCollection.extend({
	mode: syModel
});
