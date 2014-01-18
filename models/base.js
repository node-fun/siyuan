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
		syModel.__super__.initialize.apply(this, arguments);
		this.on('creating', this.creating, this);
		this.on('created', this.created, this);
		this.on('updating', this.updating, this);
		this.on('updated', this.updated, this);
		this.on('saving', this.saving, this);
		this.on('saved', this.saved, this);
		this.on('fetching', this.fetching, this);
		this.on('fetched', this.fetched, this);
		this.on('destroying', this.destroying, this);
		this.on('destroyed', this.destroyed, this);
	},

	creating: function () {
		//
	},
	created: function () {
		//
	},
	updating: function () {
		//
	},
	updated: function () {
		//
	},
	saving: function () {
		// pick attributes
		this.attributes = this.pick(this.fields);
	},
	saved: function () {
		//
	},
	fetching: function () {
		//
	},
	fetched: function () {
		//
	},
	destroying: function () {
		//
	},
	destroyed: function () {
		//
	},

	toJSON: function () {
		var ret = syModel.__super__.toJSON.apply(this, arguments);
		// omit
		ret = _.omit(ret, this.omitInJSON);
		// for timestamp
		ret = this.forTimestamp(ret);
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
	}
}, {

});

syCollection = syModel.Set = syCollection.extend({
	mode: syModel
});
