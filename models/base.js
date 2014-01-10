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
		// pick attributes
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

	toJSON: function () {
		var ret = syModel.__super__
			.toJSON.apply(this, arguments);
		// omit
		ret = _.omit(ret, this.omitInJSON);
		// for timestamp
		ret = this.forTimestamp(ret);
		return ret;
	}
}, {

});

syCollection = syModel.Set = syCollection.extend({
	mode: syModel
});
