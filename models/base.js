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
	omitInJSON: [],

	initialize: function () {
		var ret = syModel.__super__
			.initialize.apply(this, arguments);
		this.on('saving', this.saving, this);
		return ret;
	},

	saving: function () {
		var ret = syModel.__super__
			.initialize.apply(this, arguments);
		this.attributes = this.pick(this.fields);
		return ret;
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
		// omit
		attrs = _.omit(attrs, this.omitInJSON);
		// for timestamp
		attrs = this.forTimestamp(attrs);
		return attrs;
	}
}, {

});

syCollection = syModel.Set = syCollection.extend({
	mode: syModel
});
